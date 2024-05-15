import { Probot } from 'probot';

// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

export default (app: Probot, cwd: string, getRouter: any) => {
  // NOTE: sample code
  // app.on(['issues.opened'], async (context) => {
  //   const issueComment = context.issue({
  //     body: 'Thanks for opening this issue!',
  //   });
  //   await context.octokit.issues.createComment(issueComment);
  // });

  // On pull request, check that pull request changed files have Korean characters, and if so, add a comment to the pull request and block the pull request from being merged
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    const pr = context.payload.pull_request;
    const owner = pr.base.repo.owner.login;
    const repo = pr.base.repo.name;

    const files = await context.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pr.number,
      per_page: 999,
    });

    const koreanCharRegex = /[ㄱ-ㅎ가-힣]/;

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
    });

    // if there are Korean characters in the file name, add a comment to the pull request and close the pull request
    const koreanFilenames = files.data.filter((file) => koreanCharRegex.test(file.filename));
    if (koreanFilenames.length > 0) {
      const comment = context.issue({
        body: [
          'This pull request contains Korean characters in the file name. Please rename the files and try again.',
          ...koreanFilenames.map((file) => `- ${file.filename}`),
        ].join('\n'),
      });
      await context.octokit.issues.createComment(comment);
      await context.octokit.pulls.update({ owner, repo, pull_number: pr.number, state: 'closed' });
    }
  });
};
