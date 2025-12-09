#!/bin/bash
set -e

# Checkout and update develop branch
git checkout develop && git pull origin develop

# Push to edge
git push -f origin HEAD:edge

# Get current version from package.json
current_version=$(node -p "require('./package.json').version")

# Get next version based on commits
next_version=$(get-next-version --fix-prefixes "fix,chore,build,refactor,ref,perf")

# Determine the semver bump type (major, minor, or patch)
bump_type=$(node -e "
const semver = require('semver');
const diff = semver.diff('$current_version', '$next_version');
console.log(diff || 'patch');
")

echo "Current version: $current_version"
echo "Next version: $next_version"
echo "Bump type: $bump_type"

# Create release branch
git checkout -b "release-$next_version"

# Bump version in package.json
npm version "$bump_type"

# Push release branch and tags
git push origin "release-$next_version"
git push --tags

# Create pull requests to develop, release, and master
echo "Creating pull requests..."
gh pr create --base develop --title "Release: merge to develop" --body "Release version $next_version"
gh pr create --base release --title "Release: merge to release" --body "Release version $next_version"
gh pr create --base master --title "Release: merge to master" --body "Release version $next_version"

echo "Release process complete!"
echo "PRs created for develop, release, and master branches"
