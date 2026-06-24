(function () {
    "use strict";

    window.API_BASE = "https://tempdhas.onrender.com";

    window.getAuthHeaders = function(extraHeaders = {}) {
        const token = localStorage.getItem("dhas_token");

        const headers = {
            ...extraHeaders
        };

        if (token) {
            headers["Authorization"] = "Bearer " + token;
        }

        return headers;
    };

})();
