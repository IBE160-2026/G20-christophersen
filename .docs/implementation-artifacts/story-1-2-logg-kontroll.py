from pathlib import Path
import os, subprocess, shlex, sys
from datetime import datetime
from zoneinfo import ZoneInfo
root = Path(__file__).resolve().parents[2]
env = os.environ.copy()
env['PATH'] = '/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:' + env['PATH']
env['npm_config_cache'] = '/tmp/ibe160-story-1-2-npm-cache'
args = sys.argv[1:]
result = subprocess.run(args, cwd=root, env=env, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
entry = f'\n[{datetime.now(ZoneInfo("Europe/Oslo")).isoformat()}] $ {shlex.join(args)}\n{result.stdout}\nExit: {result.returncode}\n'
with (root / '.docs/implementation-artifacts/story-1-2-kontroller.txt').open('a') as log:
 log.write(entry)
print(entry)
sys.exit(result.returncode)
