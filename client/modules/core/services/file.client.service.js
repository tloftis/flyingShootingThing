'use strict';

angular.module('core').factory('FileService', ['$q','$http','Upload','MessageParserService',
    function ($q,$http,Upload,MessageParserService) {

        var parseErrorMessage = function (error) {
            return {message: MessageParserService.parseMessage(error)};
        };

        var fileService = function () {

        };

        /** readFileObject
         * Constructor that will maintain the progress percentage and loading state variable for this instance
         */
        var readFileObject = function () {
            this.progress = 0;
            this.loading = false;
        };

        /** readFileObject.readFile
         * Using the HTML5 file reader, read in a file, track progress, and return the read file
         * @param file
         * @returns {*}
         */
        readFileObject.prototype.readFile = function (file) {
            var _this = this;

            if (!file) {
                return $q.reject({message: 'No file selected'});
            }

            if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                $q.reject({message: 'Your browser do not support reading file'});
            }

            var deferred = $q.defer();

            _this.loading = false;
            var reader = new FileReader();

            //Event fired after the file has been completely read into the browser
            reader.onload = function (e) {
                _this.loading = false;
                deferred.resolve(e.target.result);
                reader = null;
            };

            //Maintain the reader progress event
            reader.onprogress = function (data) {

                if (data.lengthComputable) {
                    _this.progress = parseInt(((data.loaded / data.total) * 100), 10);
                    console.log(_this.progress);
                }
            };

            //Event fired if the file read is aborted
            reader.onabort = function (e) {
                _this.loading = false;
                deferred.reject({message: 'Fail to convert file in base64, aborted: ' + e.message});
                reader = null;
            };

            reader.onerror = function (e) {
                _this.loading = false;
                deferred.reject({message: 'Fail to convert file in base64, error: ' + e.message});
                reader = null;
            };

            _this.loading = true;
            reader.readAsDataURL(file);

            return deferred.promise;
        };

        fileService.prototype.readFileObject = readFileObject;

        /** uploadFileObject
         * Constructor that will maintain the progress percentage for this instance
         */
        var uploadFileObject = function () {
            this.progress = 0;
        };

        /** uploadFileObject.upload
         * Uploads a file from the client to the server, tracking the progress of the upload
         * @param file
         * @returns {jQuery.promise|promise.promise|promise|d.promise|o.deferred.promise|.ready.promise|*}
         */
        uploadFileObject.prototype.upload = function (url,file,metadata) {
            var _this = this;
            var deferred = $q.defer();
            var _metadata = metadata || {};
            Upload.upload({
                url: url,
                fields: _metadata,
                file: file
            }).progress(function (evt) {
                _this.progress = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function (data, status, headers, config) {
                deferred.resolve(data);

            }).error(function (data, status, headers, config) {
                _this.progress = 0;
                deferred.reject(parseErrorMessage(data));
            });

            return deferred.promise;
        };

        fileService.prototype.uploadFileObject = uploadFileObject;

        /** fileService.deleteFile
         * Deletes a file from the gridstore on the server based on the fileId
         * @param fileId
         * @returns {jQuery.promise|promise.promise|promise|d.promise|o.deferred.promise|.ready.promise|*}
         */
        fileService.prototype.deleteFile = function(url,fileId) {
            var deferred = $q.defer();
            $http.delete(url + '/' + fileId)
                .success(function (data, status, headers, config) {
                    // assign the returned values appropriately
                    // this callback will be called asynchronously
                    // when the response is available
                    console.log('Removed File on failed step save');
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    deferred.reject(parseErrorMessage(data));
                });

            return deferred.promise;
        };

        return fileService;
    }]);
