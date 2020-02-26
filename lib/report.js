async function report ({ repos }, log, repo, sha, state, blockers) {
  let description = ''
  switch (state) {
    case 'success':
      description = 'All dependencies are resolved'
      break

    case 'failure':
      description = `Blocked by ${blockers.map(i => '#' + i).join()}`
      break

    default:
      description = 'Checking dependencies'
      break
  }

  log('Sending updated status: ' + description)
  return repos.createStatus({
    context: 'Archa Github Checks',
    description,
    ...repo,
    state,
    sha
  })
}

module.exports = report
