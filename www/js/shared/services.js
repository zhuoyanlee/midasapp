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