(function () {
    angular.module("siiAPP")
        .directive("siiCamera", [
            "$q",
            "$uibModal",
            function ($q, $uibModal) {
                return {
                    restrict: "AE",
                    scope : {
                        facingMode : "="
                    },
                    link: function (__scope, __element, __attr) {

                        var cameraPopOverInstance;
                        var video;
                        let streamStarted = false;
                        var tracks = [];
                       
                        var FACINGMODE = {
                            user : "user",
                            environment : "environment"
                        }
                        
                        __scope.inputDevices = [];
                        __scope.successCallback = __successCallback;
                        __scope.cancel = __cancel;
                        __scope.pauseStream = pauseStream;
                        __scope.doScreenshot = doScreenshot;
                        __scope.changeFacingMode = __changeFacingMode;
                       
                        
                        var h = window.outerWidth;
                        var w = window.outerWidth;
                        var mw = window.outerWidth*2;
                        var mh = window.outerHeight*2;

                        __element.click(__init);
                        
                        function __init() {
                            cameraPopOverInstance = $uibModal.open({
                                templateUrl: "sii.camera.tpl.html",
                                scope: __scope,
                                windowClass : "sii-customer-camera "+__scope.facingMode,
                                keyboard : false,
                                backdrop : false
                            });

                            // on render start stream
                            cameraPopOverInstance.rendered.then(function(){
                                video = document.getElementById('camera-video');
                                __setVideoDimentions();
                                // getCameraSelection();
                                __playStream();
                            });

                            return cameraPopOverInstance;
                        }

                        function __setVideoDimentions(){
                            video.width = w;
                            video.height = h;
                        }

                        function __successCallback(captureB64) {
                            try {
                                __stop();
                                cameraPopOverInstance.close({
                                    base64Image: captureB64
                                });
                                console.log(captureB64);
                            } catch (e) { }
                        }

                        function __cancel() {
                            try {
                                cameraPopOverInstance.dismiss(false);
                                __stop();
                            } catch (e) { }
                            
                        }

                        function __stop(){
                            try{
                                streamStarted=false;
                                tracks.forEach(function(track) { track.stop(); });
                                video.pause();
                            }catch(e){}
                        }

                        
                        function __playStream() {
                            try{
                                if (streamStarted) {
                                    video.play();
                                    return;
                                }
                                if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
                                    startStream();
                                }
                            }catch(e){
                                throw "PLAY_STREAM_ERROR";
                            }
                        };

                        function __changeFacingMode(){
                            if(__scope.facingMode == FACINGMODE.user){
                                __scope.facingMode = FACINGMODE.environment;
                            }else{
                                __scope.facingMode = FACINGMODE.user;
                            }
                            __stop();
                            __playStream();
                        }

                        function __updateCameraConstraint(){
                            
                            var constraints = {
                                audio : false, // audio nop suported
                                video: {}
                            };
                            
                            if(__scope.facingMode){
                                constraints.video.facingMode = __scope.facingMode;
                            }else{
                                constraints.video.width = {
                                    min: w,
                                    ideal: w,
                                    max: mw,
                                }
                                constraints.video.height = {
                                    min: h,
                                    ideal: w,
                                    max: mh
                                }
                            }

                            return constraints;
                        }

                        function startStream(constraints) {
                            var def = $q.defer();
                            var constraints = __updateCameraConstraint();
                            navigator.mediaDevices.getUserMedia(constraints)
                                .then(function (mediaStream) {
                                    handleStream(mediaStream);
                                },function(error){
                                    def.reject(__normalizeError(error))
                                }).catch(function (error) {
                                    def.reject(__normalizeError(error))
                                });
                            return def.promise;
                        };

                        function handleStream(stream) {
                            video.srcObject = stream;
                            tracks = stream.getTracks();
                            console.log(tracks);
                            streamStarted = true;
                        };

                        function pauseStream(){
                            video.pause();
                        };

                        function doScreenshot(){
                            var canvas = document.getElementById('camera-canvas');
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            canvas.getContext('2d').drawImage(video, 0, 0);
                            var b64 = canvas.toDataURL('image/webp');
                            __successCallback(b64);
                        };

                        function __normalizeError(error) {
                            alert(error);
                            return error;
                        }
                    }
                }
            }
        ])
})();
