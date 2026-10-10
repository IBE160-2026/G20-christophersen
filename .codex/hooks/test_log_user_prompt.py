"""Tester med fiktive hemmeligheter og midlertidige loggfiler."""

import concurrent.futures
import datetime as dt
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import log_user_prompt as logger


class PromptLoggingTests(unittest.TestCase):
    def test_redaction(self):
        examples = [
            ('OPENAI_API_KEY="sk-proj-' + 'a' * 40 + '"', 'OPENAI_API_KEY=REDACTED'),
            ('{"password": "fiktivt passord med mellomrom"}', '{"password": REDACTED}'),
            ('passordet mitt er "bare en test"', 'passordet mitt er REDACTED'),
            ('token: fiktiv-token', 'token: REDACTED'),
            ('{"password": "abc\\\"secret-tail"}', '{"password": REDACTED}'),
            ('password = "line1\nsecret-tail"', 'password = REDACTED'),
            ('password: |\n  secret-value\n  more-secret\nNeste felt', 'password: REDACTED\nNeste felt'),
            ('Authorization: Bearer fiktiv-token', 'Authorization: Bearer REDACTED'),
            ('https://navn:passord@example.test/x', 'https://REDACTED@example.test/x'),
            ('ghp_' + 'a' * 36, 'REDACTED'),
            ('AKIA' + 'A' * 16, 'REDACTED'),
            ('eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.fake', 'REDACTED'),
            ('-----BEGIN PRIVATE KEY-----\nfiktivt\n-----END PRIVATE KEY-----', 'REDACTED'),
        ]
        for prompt, expected in examples:
            with self.subTest(prompt=prompt):
                self.assertEqual(logger.redact(prompt), expected)

    def test_unicode_multiline_and_allowed_fields_only(self):
        prompt = 'Ufarlig testprompt: æøå\nAndre linje med "sitater".'
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(logger, 'LOG_DIR', Path(directory).resolve()):
                event = {'hook_event_name': 'UserPromptSubmit', 'cwd': str(logger.ROOT),
                         'session_id': 'test-session', 'turn_id': 'test-turn', 'prompt': prompt,
                         'transcript_path': '/ikke/les', 'extra_secret': 'ikke-lagre'}
                logger.log_prompt(event)
                logger.log_prompt(dict(event, turn_id='test-turn-2'))
            rows = [json.loads(line) for line in (Path(directory) / 'session-test-session.jsonl').read_text().splitlines()]
            self.assertEqual(len(rows), 2)
            self.assertEqual(rows[0]['prompt'], prompt)
            self.assertEqual(set(rows[0]), {'timestamp', 'session_id', 'turn_id', 'prompt'})
            self.assertEqual(dt.datetime.fromisoformat(rows[0]['timestamp']).utcoffset(), dt.timedelta(0))

    def test_daily_fallback(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(logger, 'LOG_DIR', Path(directory).resolve()):
                logger.log_prompt({'hook_event_name': 'UserPromptSubmit', 'cwd': str(logger.ROOT), 'prompt': 'Test'})
            files = list(Path(directory).glob('day-*.jsonl'))
            self.assertEqual(len(files), 1)
            record = json.loads(files[0].read_text())
            self.assertIsNone(record['session_id'])
            self.assertIsNone(record['turn_id'])

    def test_concurrent_writers(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(logger, 'LOG_DIR', Path(directory).resolve()):
                def write(index):
                    logger.log_prompt({'hook_event_name': 'UserPromptSubmit', 'cwd': str(logger.ROOT),
                                       'session_id': 'parallel-test', 'turn_id': str(index), 'prompt': 'Test\n' * 1000})
                with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
                    list(pool.map(write, range(24)))
            rows = [json.loads(line) for line in (Path(directory) / 'session-parallel-test.jsonl').read_text().splitlines()]
            self.assertEqual({row['turn_id'] for row in rows}, {str(i) for i in range(24)})

    def test_invalid_events_do_not_write(self):
        base = {'hook_event_name': 'UserPromptSubmit', 'cwd': str(logger.ROOT), 'prompt': 'Test'}
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(logger, 'LOG_DIR', Path(directory).resolve()):
                for override in ({'prompt': None}, {'session_id': '../escape'}, {'turn_id': 'x/y'},
                                 {'cwd': '/tmp'}, {'hook_event_name': 'Stop'}):
                    with self.assertRaises((ValueError, TypeError)):
                        logger.log_prompt(dict(base, **override))
            self.assertEqual(list(Path(directory).iterdir()), [])

    def test_symlink_is_not_followed(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory).resolve()
            target = folder / 'target'
            target.write_text('Uendret')
            (folder / 'session-test.jsonl').symlink_to(target)
            with patch.object(logger, 'LOG_DIR', folder):
                with self.assertRaises(OSError):
                    logger.log_prompt({'hook_event_name': 'UserPromptSubmit', 'cwd': str(logger.ROOT),
                                       'session_id': 'test', 'prompt': 'Test'})
            self.assertEqual(target.read_text(), 'Uendret')

    def test_errors_never_echo_input(self):
        result = subprocess.run([sys.executable, str(Path(logger.__file__))], input='invalid-fiktiv-hemmelighet',
                                text=True, capture_output=True)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, '')
        self.assertNotIn('invalid-fiktiv-hemmelighet', result.stderr)


if __name__ == '__main__':
    unittest.main()
