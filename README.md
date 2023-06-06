# bp - version bump

**In development**

Bp is a package that helps you to increase
semver versions in your project. It takes the current
version, increases it, and then updates all matches
in the specified files with the new version.

## Configuration

Bp expects a `bp.conf.json` file, which
looks like this: 

```
{
	"currentVersion": "20.0.3",
	"rules": [
		{"file": "bp.conf.json", "version": "\"currentVersion\": \"{{version}}\""},
		{"file": "manifest.xml", "version": "\"version\": \"{{version}}\""}
	]
}
```
- `currentVersion` holds current software's version.
- `rules` is an array of objects with information about files that contain version
  strings and how version strings look. `{{version}}` in the "version" property
  is an actual semver version. Use `\"` if you want to escape quotes.

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
`bp.conf.json` should look so:


```
{
	"currentVersion": "20.0.3",
	"rules": [
		{"file": "bp.conf.json", "version": "\"currentVersion\": \"{{version}}\""},
		{"file": "android/build.gradle", "version": "versionName \"{{version}}\"}
	]
}
```

Note that bp.conf.json is also presented in the config file.

## Usage

Use `bump` command with a version number to increment (major, minor, or patch),
for example:

```
npx bp bump --major
```

There're also a few optional flags:

- `--commit`, `-c` - if set, adds all files listed in `bp.conf.js` to git
  and create a commit with the "Bump version" message.
- `--tag`, `-t` - create a tag after version increment with new version as
  annotate message
- `--verbose`, `-v` - print the list of files and the result of version replacement
  in them. 

Bump version and create a "Bump version" commit: 

```
npx bp bump --patch --commit
```

## TODO

- [ ] Get rid of `replace-in-file` package dependency
- [ ] Add `set` command to manually set the version
- [x] Create tags in git, not only commits