# bpv - BumP Version

Bpv is a package that helps you to increase
semver versions in your project. It takes the current
version, increases it, and then updates all matches
in the specified files with the new version.

## Installation

```
npm i -D bpv
```

Or, you may want to install it globally:

```
npm i -g bpv
```

## Configuration

Bpv expects a `.bpv.json` or `bpv.conf.json` file, which
looks like this:

```
{
	"currentVersion": "20.0.3",
        "commitMessage": "chore: bump version",
	"rules": [
		{"file": "bpv.conf.json", "version": "\"currentVersion\": \"{{version}}\""},
		{"file": "manifest.xml", "version": "\"version\": \"{{version}}\""}
	]
}
```
- `currentVersion` holds current software's version.
- `rules` is an array of objects with information about files that contain version
  strings and how version strings look. `{{version}}` in the "version" property
  is an actual semver version. Use `\"` to escape quotes.
- `commitMessage`(**optional**) is a commit message that will be used if  `--commit` flag is provided

### Example

If we have a `build.gradle` file:

```
    android {
      namespace 'com.example.testapp'
      compileSdk 33

      defaultConfig {
          applicationId "com.example.testapp"
          minSdk 24
          targetSdk 33
          versionCode 1
          versionName "1.0.3"
          ...
      }
    }
    ...

```

And we want to increment version only in this file, our
`bpv.conf.json` should look so:


```
{
	"currentVersion": "1.0.3",
	"rules": [
		{"file": "bpv.conf.json", "version": "\"currentVersion\": \"{{version}}\""},
		{"file": "android/build.gradle", "version": "versionName \"{{version}}\""}
	]
}
```

Note that bpv.conf.json is also presented in the config file.



## Usage

### Increment version

Use `bump` command with a version number to increment (major, minor, or patch),
for example:

```
npx bpv bump --major
```

There're also a few optional flags:

- `--commit`, `-c` - if set, bpv creates
  a commit with the "Bump version" message. Under the hood
  `bpv` uses `git add -u` or `hg ci` commands to add files, so *files that are not
  in the git index won't be commited*. **Supports git and mercurial.**
- `--tag`, `-t` - create a tag after version increment with new version as
  annotate message
- `--verbose`, `-v` - print the list of files and the result of version replacement
  in them.

Bump version and create a "Bump version" commit:

```
npx bpv bump --patch --commit
```

### Set version

Use the `set` command to set a version directly:

```
npx bpv set "1.0.0-beta.0"
```

The `set` command also accepts `--commit`, `--tag` and `--verbose` flags.

### Test version bump

You can check how a command will work without
any real changes with a `--dry` (`-d`) option.
It prints a new version and the list of files that will be changed:

```
npx bpv bump --major --dry
```

Output:

```
DRY RUN MODE IS ON. NO FILES WILL BE ACTUALLY MODIFIED

New version is: 2.0.0
File: bpv.conf.json changed: true
File: app/last_changelog.md changed: true
```

You can use `--dry` option with `--commit` or `--tag` options as well.
No files will be committed and no tags will be created, but you can
see any potential issues:

```
npx bpv bump --major -dct
```

Output:

```
Can't commit because the repository has modified files
```


## TODO

- [x] Use `bp.conf.json` config file instead of `bpv.conf.json`
- [x] Check if git is available before commit/tag
- [x] Add support for other VCS (mercurial)
- [x] Get rid of `replace-in-file` package dependency
- [x] Add `set` command to manually set the version
- [x] Create tags in git, not only commits
