<p align="center">
    <h2 align="center">Indigo Minimalist Jekyll Template - <a href="http://sergiokopplin.github.io/indigo/">Demo</a> · <a href="https://travis-ci.org/sergiokopplin/indigo"><img src="https://camo.githubusercontent.com/5393485b732749b3499264168fa8af60166071e8/68747470733a2f2f7472617669732d63692e6f72672f73657267696f6b6f70706c696e2f696e6469676f2e7376673f6272616e63683d67682d7061676573" alt="Build Status" data-canonical-src="https://travis-ci.org/sergiokopplin/indigo.svg?branch=gh-pages" style="max-width:100%;"></a></h2>
</p>

<p align="center">This is a simple and minimalist template for Jekyll for those who likes to eat noodles.</p>

***

<p align="center">
    <b><a href="README.md#what-has-inside">What has inside</a></b>
    |
    <b><a href="README.md#setup">Setup</a></b>
    |
    <b><a href="README.md#settings">Settings</a></b>
    |
    <b><a href="README.md#how-to">How to</a></b>
</p>

<p align="center">
    <img src="https://raw.githubusercontent.com/sergiokopplin/indigo/gh-pages/assets/screen-shot.png" />
</p>

## What has inside

- [Jekyll](https://jekyllrb.com/), [Sass](http://sass-lang.com/) ~[RSCSS](http://rscss.io/)~ and [SVG](https://www.w3.org/Graphics/SVG/)
- Tests with [Travis](https://travis-ci.org/)
- Google Speed: [98/100](https://developers.google.com/speed/pagespeed/insights/?url=http%3A%2F%2Fsergiokopplin.github.io%2Findigo%2F);
- No JS. :sunglasses:

## Setup

0. :star: to the project. :metal:
2. Fork the project [Indigo](https://github.com/sergiokopplin/indigo/fork)
3. Edit `_config.yml` with your data (check <a href="README.md#settings">settings</a> section)
4. Write some posts :bowtie:

If you want to test locally on your machine, do the following steps also:

1. Install [Jekyll](http://jekyllrb.com), [NodeJS](https://nodejs.org/) and [Bundler](http://bundler.io/).
2. Clone the forked repo on your machine
3. Enter the cloned folder via terminal and run `bundle install`
4. Then run `bundle exec jekyll serve --config _config.yml,_config-dev.yml`
5. Open it in your browser: `http://localhost:4000`
6. Test your app with `bundle exec htmlproofer ./_site`
7. Do you want to use the [jekyll-admin](https://jekyll.github.io/jekyll-admin/) plugin to edit your posts? Go to the admin panel: `http://localhost:4000/admin`. The admin panel will not work on GitHub Pages, [only locally](https://github.com/jekyll/jekyll-admin/issues/341#issuecomment-292739469).

## Settings

You must fill some informations on `_config.yml` to customize your site.

```
name: John Doe
bio: 'A Man who travels the world eating noodles'
picture: 'assets/images/profile.jpg'
...

and lot of other options, like width, projects, pages, read-time, tags, related posts, animations, multiple-authors, etc.
```

## How To?

Check the [FAQ](./FAQ.md) if you have any doubt or problem.

## Build Commands

This site includes a comprehensive Makefile for easy building and development. Here are the most common commands:

### Quick Start
```bash
make install    # Install dependencies
make build      # Build for production
make serve      # Start development server
```

### Development Workflow
```bash
make dev        # Complete development setup: clean, install, build, serve
make clean      # Clean build directory
make watch      # Watch for changes and rebuild
```

### Available Commands
Run `make help` to see all available commands including:
- `make install` - Install Ruby dependencies via Bundler
- `make build` - Build the site for production
- `make build-dev` - Build the site for development
- `make serve` - Start local development server
- `make publish` - Build and publish to GitHub Pages
- `make clean` - Clean the build directory
- `make test` - Build and test the site
- `make status` - Show git status and site info
- `make version` - Show Jekyll and Ruby versions

### Publishing to GitHub Pages
```bash
make preview-publish  # Preview what would be published
make publish          # Build and publish (with confirmation)
make publish-force    # Force publish without confirmation
```

### Docker Support
If you prefer Docker, use the `-docker` suffix:
```bash
make install-docker  # Pull Jekyll Docker image
make build-docker    # Build using Docker
make serve-docker    # Serve using Docker
```

---

[MIT](http://kopplin.mit-license.org/) License © Sérgio Kopplin
