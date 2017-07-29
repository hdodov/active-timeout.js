window.activeTimeout = (function () {

    // Get Visibility API properties.
    var _visibility = (function () {
        var prop, evnt;

        if ("hidden" in document) {
            prop = "hidden";
            evnt = "visibilitychange";
        } else if ("msHidden" in document) {
            prop = "msHidden";
            evnt = "msvisibilitychange";
        } else if ("webkitHidden" in document) {
            prop = "webkitHidden";
            evnt = "webkitvisibilitychange";
        } else {
            return null;
        }

        return {
            hidden: prop,
            event: evnt
        };
    })();

    var _pulseDelay = (1000 / 60);
    function _delay(callback) {
        if (typeof requestAnimationFrame !== "undefined") {
            requestAnimationFrame(callback);
        } else {
            setTimeout(callback, _pulseDelay);
        }
    }

    // Perform an interval until a predicate callback returns false.
    function pulse(callback) {
        var ignoreNextTick = false;
        var visibilityCallback = null;

        if (_visibility !== null) {
            visibilityCallback = function (e) {
                if (document[_visibility.hidden]) {
                    ignoreNextTick = true;
                }
            };

            document.addEventListener(
                _visibility.event,
                visibilityCallback
            );
        }

        (function measure(last) {
            var proceed = false, now = Date.now();

            // If the browser was out of focus, the next tick should be
            // ignored, otherwise the inactive time would be added and this
            // whole charade would be meaningless.
            if (ignoreNextTick) {
                ignoreNextTick = false;
                proceed = true;
            } else {
                if (_visibility && document[_visibility.hidden]) {
                    // Page is hidden, continue to pulse and wait for focus.
                    proceed = true;
                } else {
                    if (!last) {
                        // First iteration of the recursion, continue and wait
                        // for some time to pass.
                        proceed = true;
                    } else {
                        // Finally, the predicate decides whether to continue.
                        proceed = callback(now - last);
                    }
                }
            }

            if (proceed === true) {
                _delay(function () {
                    measure(now);
                });
            } else if (visibilityCallback) {
                document.removeEventListener(
                    _visibility.event,
                    visibilityCallback
                );
            }
        })();   
    }

    var t = 0;
    pulse(function (tick) {
        t += tick;
        console.log(t);
        return true;
    });

    function activeTimeout(completeCallback, tickCallback, time) {
        return;

        var ignoreNextTick = false;
        var visibilityCallback = null;

        if (typeof tickCallback === "number") {
            time = tickCallback;
            tickCallback = null;
        }

        if (_visibility !== null) {
            visibilityCallback = function (e) {
                if (document[_visibility.hidden]) {
                    ignoreNextTick = true;
                }
            };

            document.addEventListener(
                _visibility.event,
                visibilityCallback
            );
        }

        pulseInterval(function (tick) {
            if (ignoreNextTick === true) {
                ignoreNextTick = false;
                return true;
            }

            time -= tick;

            if (typeof tickCallback === "function") {
                tickCallback(time, tick);
            }

            if (time <= 0) {
                if (visibilityCallback) {
                    document.removeEventListener(
                        _visibility.event,
                        visibilityCallback
                    );
                }

                completeCallback();
                return false;
            } else {
                return true;
            }
        });
    }

    return activeTimeout;
})();