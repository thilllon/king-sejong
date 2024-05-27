import { Probot } from 'probot';

// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

// second argument: { cwd?: string; getRouter: any }
export const probotApp = (app: Probot) => {
  // On pull request, check that pull request changed files have Korean characters, and if so, add a comment to the pull request and block the pull request from being merged
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    const pr = context.payload.pull_request;
    const owner = pr.base.repo.owner.login;
    const repo = pr.base.repo.name;
    const koreanCharRegex = /[ㄱ-ㅎ가-힣]/;

    let hasKoreanChar = false;

    const files = await context.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pr.number,
      per_page: 999,
    });

    // leave a review comment on the pull request at the exact line where the Korean characters are found
    files.data.forEach(async (file) => {
      const blobResponse = await context.octokit.git.getBlob({ owner, repo, file_sha: file.sha });
      const content = Buffer.from(blobResponse.data.content, 'base64').toString('utf-8');
      content.split('\n').forEach(async (line, index) => {
        if (koreanCharRegex.test(line)) {
          await context.octokit.pulls.createReview({
            owner,
            repo,
            pull_number: pr.number,
            event: 'REQUEST_CHANGES',
            comments: [
              {
                body: 'This line contains Korean characters.',
                path: file.filename,
                line: index + 1,
              },
            ],
          });
        }
      });
      hasKoreanChar = true;
    });

    // if there are Korean characters in the file name, add a comment to the pull request and close the pull request
    const koreanFilenames = files.data.filter((file) => koreanCharRegex.test(file.filename));
    if (koreanFilenames.length > 0) {
      await context.octokit.issues.createComment(
        context.issue({
          body: [
            'This pull request contains Korean characters in the file name. Please rename the files and try again.',
            ...koreanFilenames.map((file) => `- ${file.filename}`),
          ].join('\n'),
        }),
      );
      await context.octokit.pulls.update({ owner, repo, pull_number: pr.number, state: 'closed' });
      hasKoreanChar = true;
    }

    if (!hasKoreanChar) {
      await context.octokit.issues.createComment(
        context.issue({ body: 'This pull request contains no Korean characters.' }),
      );
    }
  });

  // NOTE: sample code
  // app.on(['issues.opened'], async (context) => {
  //   const issueComment = context.issue({
  //     body: 'Thanks for opening this issue!',
  //   });
  //   await context.octokit.issues.createComment(issueComment);
  // });

  // NOTE: sample code
  /**
   * Deployments API example
   * See: https://developer.github.com/v3/repos/deployments/ to learn more
   */
  // app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
  //   // Creates a deployment on a pull request event
  //   // Then sets the deployment status to success
  //   // NOTE: this example doesn't actually integrate with a cloud
  //   // provider to deploy your app, it just demos the basic API usage.
  //   app.log.info(context.payload);

  //   // Probot API note: context.repo() => { username: 'hiimbex', repo: 'testing-things' }
  //   const response = await context.octokit.repos.createDeployment(
  //     context.repo({
  //       ref: context.payload.pull_request.head.ref, // The ref to deploy. This can be a branch, tag, or SHA.
  //       task: 'deploy', // Specifies a task to execute (e.g., deploy or deploy:migrations).
  //       auto_merge: true, // Attempts to automatically merge the default branch into the requested ref, if it is behind the default branch.
  //       required_contexts: [], // The status contexts to verify against commit status checks. If this parameter is omitted, then all unique contexts will be verified before a deployment is created. To bypass checking entirely pass an empty array. Defaults to all unique contexts.
  //       payload: {
  //         schema: 'rocks!',
  //       }, // JSON payload with extra information about the deployment. Default: ""
  //       environment: 'production', // Name for the target deployment environment (e.g., production, staging, qa)
  //       description: "My Probot App's first deploy!", // Short description of the deployment
  //       transient_environment: false, // Specifies if the given environment is specific to the deployment and will no longer exist at some point in the future.
  //       production_environment: true, // Specifies if the given environment is one that end-users directly interact with.
  //     }),
  //   );

  //   const deploymentId: number = (response.data as any).id;
  //   await context.octokit.repos.createDeploymentStatus(
  //     context.repo({
  //       deployment_id: deploymentId,
  //       state: 'success', // The state of the status. Can be one of error, failure, inactive, pending, or success
  //       log_url: 'https://example.com', // The log URL to associate with this status. This URL should contain output to keep the user updated while the task is running or serve as historical information for what happened in the deployment.
  //       description: 'My Probot App set a deployment status!', // A short description of the status.
  //       environment_url: 'https://example.com', // Sets the URL for accessing your environment.
  //       auto_inactive: true, // Adds a new inactive status to all prior non-transient, non-production environment deployments with the same repository and environment name as the created status's deployment. An inactive status is only added to deployments that had a success state.
  //     }),
  //   );
  // });
};

export default probotApp;
