// Mock for CSS files in Jest tests
// basically, prevents jest from crashing when encounters CSS imports during testing.
// w/o this, tests would fail with syntax errors when trying to import CSS files.
// i.e. - whenever you see a CSS import, don't try to parse it as JS, treat it as an
// empty object, and move on
module.exports = {};
