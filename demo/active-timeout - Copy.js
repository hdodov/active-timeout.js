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

    // Perform an interval until a predicate callback returns false.
    function pulseInterval(callback, lastCall) {
        var now = (Date.now) ? Date.now() : (new Date()).getTime(),
            tick = 0;

        if (lastCall && (!_visibility || !document[_visibility.hidden])) {
            tick = (now - lastCall);
        }

        if (callback(tick) !== false) {
            var call = function () {
                pulseInterval(callback, now);
            };

            if (typeof requestAnimationFrame !== "undefined") {
                requestAnimationFrame(call);
            } else {
                setTimeout(call, (1000 / 60));
            }
        }
    }

    function activeTimeout(completeCallback, tickCallback, time) {
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