'use strict';

/* Services */

angular.module('raw.services', [])

	.factory('dataService', function ($http, $q, $timeout) {
		  
		  return {
		    
		    loadSample : function(sample){
		      var deferred = $q.defer();
		      $http.get(sample)
			      .then(function(response){
			          deferred.resolve(response.data);
			      },
			      function(){
			          deferred.reject("An error occured while getting sample (" + sample.title + ")");
			      });
		      
		      return deferred.promise;
		    },

		    debounce : function (func, wait, immediate) {
			    var timeout;
			    var deferred = $q.defer();
			    return function() {
			      var context = this, args = arguments;
			      var later = function() {
			        timeout = null;
			        if(!immediate) {
			          deferred.resolve(func.apply(context, args));
			          deferred = $q.defer();
			        }
			      };
			      var callNow = immediate && !timeout;
			      if ( timeout ) {
			        $timeout.cancel(timeout);
			      }
			      timeout = $timeout(later, wait);
			      if (callNow) {
			        deferred.resolve(func.apply(context,args));
			        deferred = $q.defer();
			      }
			      return deferred.promise;
			    };
			  }
	  	}
	})
	.factory('sharedProperties', function () {

		var optSet = null;
		var defaultCharts = null;
		var data = null;
		var metadata = null;
		var charts = {};
		var isoscopes = {};

		return {
			initialCharts: function(rawCharts){
				defaultCharts = rawCharts.values().sort(function (a,b){ return a.title() < b.title() ? -1 : a.title() > b.title() ? 1 : 0; })
			},
			initialOptions: function(optSetArg){
				optSet = optSetArg;
			},
			initialData: function(dataArg, metadataArg){
				data = dataArg;
				metadata = metadataArg;
			},
			getDefaultChart: function(chartname){
				var tempreturn;
		        $.each(defaultCharts, function(i,v){
		          if (v.title() == optSet['charts'][chartname]['chartType']){
		          	//maybe some kind of deep copy 
		          	// might be solved with isolated scope
		          	tempreturn = v;
		          	return false;
		          }
		        });
		        return tempreturn;
			},
			getOptions: function(chartname){
				//check that this exists
				return optSet['charts'][chartname];
			},
			getData: function(){
				return data;
			},
			appendChart: function(chartname, chartobj, scope){
				charts[chartname] = chartobj;
				isoscopes[chartname] = scope;
			},
			getChart: function(chartname){
				return charts[chartname];
			},
			getScope: function(chartname){
				return isoscopes[chartname];
			}
		};
    });
