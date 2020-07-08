// Ours
const run = require('./run')
const match = require('./helpers/match')
const migrate = require('./helpers/migrate')
const inject = require('./helpers/inject')
const runToggle = require('./runToggle')

const update = async context => {
  const { payload, github, log } = context
  
  // Extract necessary info
  const origin = context.issue()
  const repo = context.repo()

  // Constants
  const labels = 'dependent'
  const state = 'open'
  const per_page = 100

  // Get all open, dependent pull requests
  return github.paginate(
    github.issues.listForRepo.endpoint.merge({ ...repo, state, labels, per_page }),
    async page => {
      console.log("RAWR", page)
      for (const issue of page.data) {
        // We only process PRs
        if (!issue.pull_request) continue

        const { number } = issue
        const owner = payload.repository.owner.login
        const repoName = payload.repository.name

        // Get full PR details
        console.log("RAWR2", github)
        const test1 = await github.pullRequests.get({ ...repo, number })
        const { data } = await github.pullRequests.get({ ...repo, number })

        // Migrate if necessary
        const ctx = inject(context, data)
        const body = await migrate(ctx)

        // Get dependencies list
        const deps = await match({ body, number })

        // Run the toggling behaviour (ie. remove the label if the dependent PR gets merged)
        await runToggle(context, number, owner, repoName, data.head.sha, deps)

        // Re-check if the original issue is a dependency of this PR
        if (deps.includes(origin.number)) {
          await run(github, repo, data.head.sha, deps)
        }
      }
    }
  )
}

module.exports = update
