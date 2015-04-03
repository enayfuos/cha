'use strict';
angular.module('App', ['ngMaterial', 'ui.router', 'ngResource'])

  .config(function ($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'public/views/partials/home.html',
      controller: 'HomeCtrl',
    })
    .state('cart', {
      url: '/cart',
      templateUrl: 'public/views/partials/cart.html',
      controller: 'CartCtrl',
    })
    .state('checkout', {
      url: '/checkout',
      templateUrl: 'public/views/partials/checkout.html',
      controller: 'CheckoutCtrl',
    })
    ;

})


.controller('ItemListCtrl', function($scope, $resource,CategoryService,SearchService, ItemService){
  
  $scope.$watch(CategoryService.getFilter, function(oldValue, newValue){
      $scope.items = ItemService.query();
  });

  $scope.$watch(SearchService.getSearch, function(oldValue, newValue){
      $scope.items = ItemService.query();
  });
})

.controller('HeaderCtrl', function($scope, CartService){
  $scope.$watch(CartService.get, function(oldValue, newValue){
      console.log('changed');
      $scope.cartCount = CartService.get().length;
  }, true);


})

.controller('HomeCtrl', function($scope, $anchorScroll, $location, ArianeService, CartService, ToastService){
  ArianeService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Lorem ipsum', '');
  $scope.optionsHidden = false;

  $scope.toggleHideOptions = function(){
    $scope.optionsHidden = !$scope.optionsHidden;
  };

  $scope.addToCart = function(item){
    CartService.add(item);
    ToastService.simpleToast("'" + item.description + "''" + ' was added to your cart.');
    //HACK: scroll to top to see toast. Fix it by telling the toast what its parent is.
    //$location.hash('header');
    //$anchorScroll();
  }

})

.controller('CheckoutCtrl', function($scope, ArianeService){
  ArianeService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Checkout', '/checkout');

})

.controller('CartCtrl', function($scope, ArianeService, CartService){
  ArianeService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Cart', '');

  $scope.items = CartService.get();

  $scope.remove = function(itemDescription){
    $scope.items = CartService.remove(itemDescription).get();
  };

})

.controller('PresentationCtrl', function($scope){

})

.controller('ArianeCtrl', function($scope, ArianeService){
  $scope.add = ArianeService.add;
  $scope.remove = ArianeService.remove;
  $scope.locations = ArianeService.get();

})

.controller('CategoryCtrl',function($scope, CategoryService,filterFilter){
  $scope.categories = CategoryService.query();
  $scope.selectCategory = function(categoryName){
   var tmp = filterFilter($scope.categories,{selected : true});
   if(tmp.length>0){
          tmp[0].selected=false;
   }
   if(categoryName){
        filterFilter($scope.categories,{name : categoryName})[0].selected=true;
   }
    CategoryService.setFilter(categoryName, $scope);
  };
})


//les services
.service('ArianeService', function(){
  var locations = [];

  return {
    add: function(name, url){
      locations.push({name: name, url: url});
      return this;
    },
    remove: function(){
      locations.pop();
      return this;
    },
    get: function(){
      return locations;
    },
    clear: function(){
      locations = [];
      return this;
    }
  };
})

.service('ItemService', function($resource, $filter, CategoryService, SearchService){
  var Item = $resource('resources/items.json');
  var items = Item.query();

  return {
    query: function(){
      var res = items;
      var categoryName = CategoryService.getFilter();
      var search = SearchService.getSearch();

      if(categoryName){
        res = res.filter(function(item){
          return item.categories == categoryName;
        });
      }

      if(search){
        res = res.filter(function(item){
          return (item.name.indexOf(search) >= 0) ||
          (item.description.indexOf(search) >= 0);
        });
      }

      return res;
    }
  };
})


.service('CartService', function(){
  var items = [];

  function indexOfItem(description){
    var i = 0;
    while(i< items.length){
      if(items[i].description === description){
        return i;
      }
      i += 1;
    }
    return -1;
  }

  return {
    add: function(item, quantity){
      quantity = quantity || 1;
      item.quantity = quantity;


      var index = indexOfItem(item.description);
      console.log(index);


      if(index >= 0){
        items[index].quantity += quantity;
      } else {
        items.push(item);
      }


      return this;
    },
    remove: function(itemDescription){
      items = items.filter(function(item){
        return item.description !== itemDescription;
      });

      return this;
    },
    clear: function(){
      items = [];
      return this;
    },
    get: function(){
      return items;
    }
  };
})

.service('ToastService', function($mdToast){
  return {
    simpleToast: function(msg){
      $mdToast.show(
        $mdToast.simple()
          .content(msg)
          .position('fit bottom right')
          .hideDelay(3000)
      );
    }
  };
})

.service('CategoryService', function($resource){
  var Category = $resource('resources/categories.json');
  var filter = '';

  return {
    query: function(){
      return Category.query();
    },
    getFilter: function(){
      return filter;
    },
    setFilter: function(newFilter){
      filter = newFilter;
    }
  };
})

.service('SearchService', function(){
  var search = '';

  return {
    getSearch: function(){
      return search;
    },
    setSearch: function(newSearch){
      search = newSearch;
    }
  };
})
;
