"use strict";
exports.config = {
    app_name: ["Headless-DMS"],
    license_key: "716e42db23e45acf8bb52398229ec3b6FFFFNRAL",
    allow_all_headers: true,
    attributes: {
        exclude: [
            "request.headers.cookie",
            "request.headers.authorization",
            "request.headers.proxyAuthorization",
            "request.headers.setCookie*",
            "request.headers.x*",
            "response.headers.cookie",
            "response.headers.authorization",
            "response.headers.proxyAuthorization",
            "response.headers.setCookie*",
            "response.headers.x*",
        ],
    },
};
