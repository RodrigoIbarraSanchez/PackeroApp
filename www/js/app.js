angular.module('ionicApp', ['ionic', 'ngCordova', 'checklist-model', "firebase"])

.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('intro', {
            url: '/',
            views: {
                'wrap': {
                    templateUrl: 'intro.html',
                    controller: 'IntroCtrl'
                }
            }
        })
        .state('main', {
            url: '/main',
            views: {
                'wrap': {
                    templateUrl: 'main.html',
                    controller: 'MainCtrl'
                }
            }
        })
        .state('signin', {
            url: '/sign-in',
            templateUrl: 'templates/sign-in.html',
            controller: 'SignInCtrl'
        })
        .state('forgotpassword', {
            url: '/forgot-password',
            templateUrl: 'templates/forgot-password.html'
        })
        .state('tabs', {
            url: '/tab',
            abstract: true,
            templateUrl: 'templates/tabs.html'
        })
        .state('tabs.envios', {
            url: '/envios',
            views: {
                'envios-tab': {
                    templateUrl: 'templates/envios.html',
                    controller: 'HomeTabCtrl'
                }
            }
        })
        .state('tabs.viajes', {
            url: '/viajes',
            views: {
                'viajes-tab': {
                    templateUrl: 'templates/viajes.html'
                }
            }
        })
        .state('mapa', {
            url: '/mapa',
            templateUrl: 'templates/mapa.html',
            controller: 'MapCtrl'
        });


    $urlRouterProvider.otherwise('/');

})

<<<<<<< HEAD
.controller('mainCtrl', ['$scope', '$state', '$ionicSideMenuDelegate', '$timeout', function ($scope, $state, $ionicSideMenuDelegate, $timeout) {

    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $timeout(function () {
        $ionicSideMenuDelegate.canDragContent(true);
    })

}])

.controller('SignInCtrl', function ($scope, $rootScope, $state, consumirAPI, $timeout, $ionicSideMenuDelegate) {
=======
.controller('IntroCtrl', function ($scope, $state) {

    // Called to navigate to the main app
    var startApp = function () {
        $state.go('main');

        // Set a flag that we finished the tutorial
        window.localStorage['didTutorial'] = true;
    };

    //No this is silly
    // Check if the user already did the tutorial and skip it if so
    /*if(window.localStorage['didTutorial'] === "true") {
      console.log('Skip intro');
      startApp();
    }*/


    // Move to the next slide
    $scope.next = function () {
        $scope.$broadcast('slideBox.nextSlide');
    };

    // Our initial right buttons
    var rightButtons = [
        {
            content: 'Next',
            type: 'button-positive button-clear',
            tap: function (e) {
                // Go to the next slide on tap
                $scope.next();
            }
    }
  ];

    // Our initial left buttons
    var leftButtons = [
        {
            content: 'Skip',
            type: 'button-positive button-clear',
            tap: function (e) {
                // Start the app on tap
                startApp();
            }
    }
  ];

    // Bind the left and right buttons to the scope
    $scope.leftButtons = leftButtons;
    $scope.rightButtons = rightButtons;


    // Called each time the slide changes
    $scope.slideChanged = function (index) {

        // Check if we should update the left buttons
        if (index > 0) {
            // If this is not the first slide, give it a back button
            $scope.leftButtons = [
                {
                    content: 'Back',
                    type: 'button-positive button-clear',
                    tap: function (e) {
                        // Move to the previous slide
                        $scope.$broadcast('slideBox.prevSlide');
                    }
        }
      ];
        } else {
            // This is the first slide, use the default left buttons
            $scope.leftButtons = leftButtons;
        }

        // If this is the last slide, set the right button to
        // move to the app
        if (index == 2) {
            $scope.rightButtons = [
                {
                    content: 'Start using MyApp',
                    type: 'button-positive button-clear',
                    tap: function (e) {
                        startApp();
                    }
        }
      ];
        } else {
            // Otherwise, use the default buttons
            $scope.rightButtons = rightButtons;
        }
    };
})

.controller('MainCtrl', function ($scope, $state) {
    console.log('MainCtrl');

    $scope.toIntro = function () {
        console.log('MainCtrl.toIntro()');
        window.localStorage['didTutorial'] = "false";
        $state.go('intro');
    }
})

.controller('SignInCtrl', function ($scope, $rootScope, $state, consumirAPI, $ionicUser, $ionicPush) {
>>>>>>> 197e7f14a8e1fc72a956054043590a0d857ed178

    $scope.signIn = function (email, pass) {
        consumirAPI.signIn(email, pass, function (token) {
            $rootScope.token = token;
            $state.go('tabs.envios');
        });
    }
    $timeout(function () {
        $ionicSideMenuDelegate.canDragContent(false);
    })
})


.controller('AppCtrl', function ($rootScope, $scope, $cordovaToast, $rootScope, $state, consumirAPI, $cordovaGeolocation, $ionicSideMenuDelegate, $timeout) {
    
    $timeout(function () {
        $ionicSideMenuDelegate.canDragContent(true);
    })

    var token = $rootScope.token;
    var detener = false;

    $scope.sinSolicitudes = 'No hay solicitudes todavía';
    $scope.solicitudesPendientes = {};
    $scope.solicitudesEspera = {};
    $scope.solicitudesConfirmadas = {};

    $scope.ofertarSolicitud = function (id) {
        consumirAPI.ofertarSolicitud(id, token, function () {
            recargarSolicitudes(function () {});
        });
    }

    $scope.rechazarSolicitud = function (id) {
        consumirAPI.rechazarSolicitud(id, token, function () {
            recargarSolicitudes(function () {});
        });
    }

    $scope.entregarEnvio = function (id) {
        consumirAPI.entregarEnvio(id, token, function () {
            //navigator.geolocation.clearWatch(generarPosiciones);
            detener = true;
            recargarSolicitudes(function () {});
        });
    }

    $scope.recogerEnvio = function (id) {
        consumirAPI.recogerEnvio(id, token, function () {
            recargarSolicitudes(function () {});
        });
    }

    $scope.verMapa = function (solicitudId) {
        var token = $rootScope.token;

        consumirAPI.obtenerCoordenadas(token, solicitudId, function (coordenadas) {

            var origen = new google.maps.Marker({
                position: {
                    lat: coordenadas.origen.latitude,
                    lng: coordenadas.origen.longitude
                },
                title: 'Origen',
                icon: 'https://packandpack.com/img/iconos/banderaVerde2.png'
            });

            var destino = new google.maps.Marker({
                position: {
                    lat: coordenadas.destino.latitude,
                    lng: coordenadas.destino.longitude
                },
                title: 'Destino',
                icon: 'https://packandpack.com/img/iconos/banderaRoja2.png'
            });

            $rootScope.origen = origen;
            $rootScope.destino = destino;

            $state.go('mapa');
        });



    }

    $scope.startTrip = function (viajeId, packeroId) {

        consumirAPI.iniciarViaje(viajeId, token, function (data) {

            console.log(data);

            recargarSolicitudes(function () {});

            var ref = new Firebase("https://packandpack.firebaseio.com/trips/" + viajeId + "/positions");
            ref.authWithCustomToken(data.token, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    console.log("Login Succeeded!", authData);


                    navigator.geolocation.getCurrentPosition(function (pos) {
                            var lat = pos.coords.latitude;
                            var lng = pos.coords.longitude;
                            console.log(lat + ', ' + lng);
                            ref.push({
                                lat: lat,
                                lng: lng
                            });
                            navigator.geolocation.watchPosition(function (position) {
                                    lat = position.coords.latitude;
                                    lng = position.coords.longitude;
                                    /*ref.push({
                                        lat: lat,
                                        lng: lng
                                    });*/
                                },
                                function (error) {
                                    console.log(error.code + ', ' + error.message);
                                }, {
                                    maximumAge: 0,
                                    timeout: 5000,
                                    enableHighAccuracy: true
                                });

                            setInterval(function () {
                                if (!detener) {
                                    console.log(lat + ', ' + lng);
                                    ref.push({
                                        lat: lat,
                                        lng: lng
                                    });
                                }
                            }, 5000);


                        },
                        function (error) {
                            alert(error.code + ', ' + error.message);
                        }, {
                            maximumAge: 0,
                            timeout: 5000,
                            enableHighAccuracy: true
                        });

                }
            });
        });

    }

    recargarSolicitudes(function () {});

    function recargarSolicitudes(callback) {
        consumirAPI.obtenerSolicitudes(token, function (solicitudes) {
            if (solicitudes.length > 0) {
                $scope.sinSolicitudes = '';
            }

            var solicitudesPendientes = [];
            var solicitudesEspera = [];
            var solicitudesConfirmadas = [];
            for (var i = 0; i < solicitudes.length; i++) {
                //Detectar si es solicitud PENDIENTE con su status 10
                if (solicitudes[i].statusId == 10) {
                    //Agregar solicitudes pendientes
                    solicitudesPendientes.push(solicitudes[i]);
                }
                //Detectar si es solicitud en ESPERA con su status 20
                if (solicitudes[i].statusId == 20) {
                    //Agregar solicitudes en espera
                    solicitudesEspera.push(solicitudes[i]);
                }
                //Detectar si es solicitud CONFIRMADA con su status 30
                if (solicitudes[i].statusId == 30) {
                    //Agregar solicitudes confirmadas
                    solicitudesConfirmadas.push(solicitudes[i]);
                }
            }

            $scope.solicitudesPendientes = solicitudesPendientes;
            $scope.solicitudesEspera = solicitudesEspera;
            $scope.solicitudesConfirmadas = solicitudesConfirmadas;
            callback();
        });
    }

    $scope.doRefresh = function () {
        recargarSolicitudes(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    function ContentController($scope, $ionicSideMenuDelegate) {
        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };
    }
})

.controller('MapCtrl', function ($rootScope, $scope, $ionicLoading, $state, $compile) {

    $scope.coordenadaActual = null;

    initialize();

    function initialize() {
        navigator.geolocation.getCurrentPosition(function (pos) {
            var mapOptions = {
                center: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                },
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("map"),
                mapOptions);

            $rootScope.origen.setMap(map);
            $rootScope.destino.setMap(map);

            var packero = new google.maps.Marker({
                position: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                },
                map: map,
                title: 'Packero',
                icon: 'https://packandpack.com/img/packMap.png '
            });

            //Marker + infowindow + angularjs compiled ng-click
            var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
            var compiled = $compile(contentString)($scope);

            var infowindow = new google.maps.InfoWindow({
                content: compiled[0]
            });

            google.maps.event.addListener(packero, 'click', function () {
                infowindow.open(map, packero);
            });

            $scope.packero = packero;
            $scope.map = map;
            //$scope.loading.hide();

        }, function (error) {
            alert('Unable to get location: ' + error.message);
        });

        navigator.geolocation.watchPosition(function (pos) {
            $scope.coordenadaActual = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };
            $scope.packero.setPosition({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            });
        }, function (error) {
            alert('Unable to get location: ' + error.message);
        });
    }
    google.maps.event.addDomListener(window, 'load', initialize);

    $scope.centerOnMe = function () {

        if (!$scope.map) {
            alert('No hay mapa');
        }

        /*$scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });*/

        $scope.map.setCenter($scope.coordenadaActual);
    };


    $scope.clickTest = function () {
        alert('Example of infowindow with ng-click');
    };

    $scope.misEnvios = function () {
        $state.go('tabs.envios');
    };

})


.controller('HomeTabCtrl', function ($scope, $rootScope, consumirAPI) {
    console.log('HomeTabCtrl');
    var token = $rootScope.token;
    var existePueblaMexico = false;
    var existeMexicoPuebla = false;
    var opcionPueblaId = 0;
    var opcionMexicoId = 0;

    $scope.weekDayLabels = [
        'Lu',
        'Ma',
        'Mi',
        'Ju',
        'Vi',
        'Sa',
        'Do'
    ];

    $scope.puebla = {
        weekDays: []
    };

    $scope.mexico = {
        weekDays: []
    };

    consumirAPI.obtenerOpcionesViaje(token, function (opcionesViaje) {
        //Recorrer todas las opciones
        for (var i = 0; i < opcionesViaje.length; i++) {
            //Detectar origen-destino
            if (opcionesViaje[i].origenId == 260 && opcionesViaje[i].destinoId == 261) {
                //caso Puebla a DF
                existePueblaMexico = true;
                opcionPueblaId = opcionesViaje[i].id;
                var weekDays = [];
                for (var w = 0; w < opcionesViaje[i].weekDays.length; w++) {
                    weekDays[w] = parseInt(opcionesViaje[i].weekDays[w]);
                }
                $scope.puebla['weekDays'] = weekDays;
            } else if (opcionesViaje[i].origenId == 261 && opcionesViaje[i].destinoId == 260) {
                //caso DF a Puebla
                existeMexicoPuebla = true;
                opcionMexicoId = opcionesViaje[i].id;
                var weekDays = [];
                for (var w = 0; w < opcionesViaje[i].weekDays.length; w++) {
                    weekDays[w] = parseInt(opcionesViaje[i].weekDays[w]);
                }
                $scope.mexico['weekDays'] = weekDays;
            }
        }
    });


    $scope.guardarOpciones = function () {

        //crear o actualizar Puebla - México
        if (!existePueblaMexico) {
            consumirAPI.opcionViaje(260, 261, $scope.puebla.weekDays, token, function (id) {
                existePueblaMexico = true;
                opcionPueblaId = parseInt(id);
                alert("Guardado correctamente");
            });
        } else {
            consumirAPI.actualizarOpcionViaje(opcionPueblaId, 260, 261, $scope.puebla.weekDays, token);
        }

        //crear o actualizar México - Puebla
        if (!existeMexicoPuebla) {
            consumirAPI.opcionViaje(261, 260, $scope.mexico.weekDays, token, function (id) {
                existeMexicoPuebla = true;
                opcionMexicoId = parseInt(id);
                alert("Guardado correctamente");
            });
        } else {
            consumirAPI.actualizarOpcionViaje(opcionMexicoId, 261, 260, $scope.mexico.weekDays, token);
        }
    }
})



//creamos nuestro servicio
.service('consumirAPI', function ($http) {

    this.obtenerCoordenadas = function (token, solicitudId, callback) {
        $http.get('https://packandpack.com/api/solicitudesenvios/' + solicitudId + '/coordenadas?access_token=' + token)
            .then(function (response) {
                //Hacer algo con response
                callback(response.data);
            }, function (x) {
                //Error en x 
            });
    }

    this.obtenerSolicitudes = function (token, callback) {
        $http.get('https://packandpack.com/api/packero/solicitudes?access_token=' + token)
            .then(function (response) {
                //Hacer algo con response
                callback(response.data);
            }, function (x) {
                //Error en x 
            });
    }

    this.ofertarSolicitud = function (id, token, callback) {
        $http.put('https://packandpack.com/api/packero/solicitudes?access_token=' + token, {
            id: id,
            status: 20
        }).then(function (response) {
                //Recargar solicitudes
                callback();
            },
            function (x) {
                //Error en x  
            });
    }

    this.rechazarSolicitud = function (id, token, callback) {
        $http.delete('https://packandpack.com/api/packero/solicitudes?id=' + id + '&access_token=' + token).then(function (response) {
                //Recargar solicitudes
                callback();
            },
            function (x) {
                //Error en x  
            });
    }


    this.opcionViaje = function (origenId, destinoId, weekDays, token, callback) {

        $http.post('https://packandpack.com/api/viajes/opciones?access_token=' + token, {
            origenId: origenId,
            destinoId: destinoId,
            weekDays: weekDays
        }).then(function (response) {
            // Hacer algo con response
            callback(response.data);
        }, function (x) {
            // Error en x
        });


        return true;
    }

    this.signIn = function (email, pass, callback) {
        $http.post("https://packandpack.com/oauth/v2/token", {
            grant_type: "password",
            client_id: "1_3bcbxd9e24g0gk4swg0kwgcwg4o8k8g4g888kwc44gcc0gwwk4",
            client_secret: "4ok2x70rlfokc8g0wws8c8kwcokw80k44sg48goc0ok4w0so0k",
            username: email,
            password: pass
        }).then(function (response) {

                if (!response.data.access_token) {
                    // Error de acceso
                    alert("El correo o la contraseña son incorrectos");
                } else {

                    //alert("Acceso correcto");
                    var token = response.data.access_token;
                    callback(token);
                }

            },
            function (x) {
                // Error de servidor
                alert("El correo o la contraseña son incorrectos");
            });
    }

    this.obtenerOpcionesViaje = function (token, callback) {
        $http.get('https://packandpack.com/api/viajes/opciones?access_token=' + token)
            .then(function (response) {
                // Hacer algo con response
                callback(response.data);
            }, function (x) {
                // Error en x
            });
    }

    this.actualizarOpcionViaje = function (id, origenId, destinoId, weekDays, token) {
        $http.put('https://packandpack.com/api/viajes/opciones?access_token=' + token, {
            id: id,
            origenId: origenId,
            destinoId: destinoId,
            weekDays: weekDays
        }).then(function (response) {
            // Hacer algo con response
            alert("Guardado correctamente");
        }, function (x) {
            // Error en x
        });
    }

    this.iniciarViaje = function (id, token, callback) {
        $http.put('https://packandpack.com/api/trips/' + id + '/start?access_token=' + token)
            .then(function (response) {
                // Hacer algo con response
                callback(response.data);
            }, function (x) {
                // Error en x
            });
    }

    this.recogerEnvio = function (id, token, callback) {
        $http.put('https://packandpack.com/api/shipments/' + id + '/pick?access_token=' + token)
            .then(function (response) {
                // Hacer algo con response
                callback();
            }, function (x) {
                // Error en x
            });
    }
    this.entregarEnvio = function (id, token, callback) {
        $http.put('https://packandpack.com/api/shipments/' + id + '/deliver?access_token=' + token)
            .then(function (response) {
                // Hacer algo con response
                callback();
            }, function (x) {
                // Error en x
            });
    }
});
