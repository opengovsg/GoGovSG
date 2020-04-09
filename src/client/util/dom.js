const ReactDOM = require('react-dom')

/* eslint-disable react/no-find-dom-node */
export default function (ref) {
  return ReactDOM.findDOMNode(ref)
}
/* eslint-enable react/no-find-dom-node */
