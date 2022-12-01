#!/bin/sh

against=HEAD

# Redirect output to stderr.
exec 1>&2

# Check changed files for an AWS keys
KEY_ID=$(git diff --cached --name-only -z $against | xargs -0 cat | perl -nle'print $& if m{(?<![A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])}')
KEY=$(git diff --cached --name-only -z $against | xargs -0 cat | perl -nle'print $& if m{(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])}')

if [ "$KEY_ID" != "" -a "$KEY_ID" != "," -a "$KEY" != "" ]; then
    echo "Found patterns for AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY"
    echo "Please check your code and remove API keys."
    echo "Key ID: $KEY_ID, Key: $KEY"
    exit 1
fi

gitguardian_secrets_check() {
  if !(command -v ggshield &> /dev/null); then
    echo "Skipping GitGuardian check for secrets as ggshield is not installed."
    return 0
  fi

  [ -e .env ] && export $(cat .env | xargs)
  if [ -z "${GITGUARDIAN_API_KEY}" ]; then
    echo "Skipping GitGuardian check for secrets as GitGuardian API key is not configured."
    return 0
  fi

  ggshield secret scan pre-commit
}

# Check changed files for secrets using GitGuardian
gitguardian_secrets_check
exit_status=$?
if [ $exit_status -ne 0 ]; then
  exit $exit_status
fi

# Normal exit
exit 0
