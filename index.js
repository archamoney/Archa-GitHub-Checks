// Native
const { join } = require('path')

// Packages
const command = require('probot-commands')

// Ours
const deprecate = require('./lib/helpers/deprecate')
const toggle = require('./lib/toggle')
const update = require('./lib/update')

module.exports = robot => {
  // Deprecated!
  command(robot, 'depends', deprecate)
  command(robot, 'ensure', deprecate)

  // Toggle label
  robot.on('pull_request.opened', toggle)
  robot.on('pull_request.edited', toggle)

  // Re-check on dependency updates
  robot.on('issues.closed', update)
  robot.on('issues.reopened', update)
  robot.on('pull_request.reopened', update)
  robot.on('pull_request.closed', update)
  robot.on('pull_request.synchronize', update)

  // Functionality from https://github.com/ryanhiebert/probot-chain used to rebase PRs.
  // Upon merging a PR which has other dependent PRs the below code will update all
  // dependent PRs to have the base that the merged PR was merged into
  robot.on('pull_request.closed', async context => {
    const { github, payload, log } = context
    const closedPullRequest = payload.pull_request

    if (closedPullRequest.base.repo.default_branch === closedPullRequest.head.ref) {
      return // Skip if the the head is the default branch
    }
    log("Pull request closed, looking to rebase dependant PRs")

    const owner = payload.repository.owner.login
    const repo = payload.repository.name
    const head = closedPullRequest.head.ref
    const base = closedPullRequest.base.ref
    const state = 'open'
    const per_page = 100

    // Get all open pull requests with a base matching this head
    github.paginate(
      github.pullRequests.getAll({owner, repo, base: head, state, per_page}),
      async page => {
        for (const {number} of page.data) {
          // Change the base to match where the original PR was merged.
          github.pullRequests.update({owner, repo, number, base})
        }
      }
    )
  })


  // Get an express router to expose new HTTP endpoints
  const app = robot.route('/')

  // Index page
  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'))
  })
}
