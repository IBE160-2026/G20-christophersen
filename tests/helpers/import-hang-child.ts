// Lokal testprosess uten dokumentdata; brukes til å bevise foreldrefrist/cleanup.
process.once('message', () => { while (true) { /* Bevisst blokkert event loop. */ } })
