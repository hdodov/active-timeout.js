# active-timeout.js
JavaScript timeout that counts only while the user is viewing the page.

# Demo
Can be seen [here](https://hdodov.github.io/active-timeout/)

# Installation
```
npm install active-timeout.js
```
or
```
git clone https://github.com/hdodov/active-timeout.js
```

# Usage
```js
activeTimeout(function () {
    // On complete.
}, function (remainingTime, tick) {
    // On tick.
}, 2000);
```
or
```js
activeTimeout(function () {
    // On complete.
}, 2000);
```
