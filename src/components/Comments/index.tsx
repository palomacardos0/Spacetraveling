// https://www.gregorygaines.com/blog/posts/2020/11/21/how-to-integrate-utterances-in-react-with-reloading-comments

import React from 'react';

class Comments extends React.Component {
  repo = 'palomacardos0/comments';
  theme = 'github-dark';
  issueTerm = 'pathname';
  label = 'Comments';
  commentsBoxRef: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    this.commentsBoxRef = React.createRef();
  }

  componentDidMount() {
    // Get comments box
    const commentsBox = this.commentsBoxRef.current;

    // Check if comments box is loaded
    if (!commentsBox) {
      return;
    }

    // Check if utterances is loaded
    if (commentsBox.childElementCount > 0) {
      return;
    }

    // Add utterances script
    this.addUtterancesScript(
      commentsBox,
      this.repo,
      this.label,
      this.issueTerm,
      this.theme,
      false,
    );
  }

  // Remove and update utterances when the page updates
  componentDidUpdate() {
    // Get comments box
    const commentsBox = this.commentsBoxRef.current;

    // Check if comments box is loaded
    if (!commentsBox) {
      return;
    }

    // Get utterances
    const utterances = document.getElementsByClassName('utterances')[0];

    // Remove utterances if it exists
    if (utterances) {
      utterances.remove();
    }

    // Add utterances script
    this.addUtterancesScript(
      commentsBox,
      this.repo,
      this.label,
      this.issueTerm,
      this.theme,
      false,
    );
  }

  addUtterancesScript = (
    parentElement,
    repo,
    label,
    issueTerm,
    theme,
    isIssueNumber,
  ) => {
    const script = document.createElement('script');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute('repo', repo);

    if (label !== '') {
      script.setAttribute('label', label);
    }

    if (isIssueNumber) {
      script.setAttribute('issue-number', issueTerm);
    } else {
      script.setAttribute('issue-term', issueTerm);
    }

    script.setAttribute('theme', theme);

    parentElement.appendChild(script);
  };

  render() {
    return <div ref={this.commentsBoxRef} />;
  }
}

export default Comments;
