function authService($http, $cookies) {
	var self = this;

	self.isAuthed = function() {
		console.log("Auth String: " + $cookies.get('authString'));

		if ($cookies.get('authString') && $cookies.get('authString').length > 0 && $cookies.get('sessionToken') && $cookies.get('sessionToken').length > 0) {
			return true;
		} else {
			return false;
		}

	};

}

function authInterceptor($location, $cookies, $injector, $q) {

	return {
		// automatically attach Authorization header
		'request' : function(req) {
			if (req.url.indexOf("/user/l") <= 0 && req.url.indexOf("https://safe-temple-72604.herokuapp.com")<=0 && $cookies.get('authString')) {
				console.log("Inserting Basic authentication header");
				req.headers.Authorization = 'Basic ' + $cookies.get('authString');

			}
			return req;
		},
		'response' : function(res) {
			return res;
		},
		// If a http error 403(forbidden) or 401(unauthorised) occurs, redirect to login screen
		'responseError' : function(res) {
			console.log("error status: " + res.status);

			if (res.status == "403" || res.status == "401") {
				console.log("Unauthorized or Forbidden");
				$injector.get('$state').transitionTo('empty');
				//notificationService.error("Your session has timed out, Please login again.");
				return $location.path('/login');

			}


			return res;
		},
	};
}