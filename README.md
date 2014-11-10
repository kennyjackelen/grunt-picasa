# grunt-picasa

> Pulls photos from Google+ to build blog posts for Jekyll.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-picasa --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-picasa');
```

## The "picasa" task

### Overview
In your project's Gruntfile, add a section named `picasa` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  picasa: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.src
Type: `String`

The path to your Jekyll app directory.

#### options.config
Type: `Object`

Authentication information for accessing your Google+ Photos.

### Usage Examples
