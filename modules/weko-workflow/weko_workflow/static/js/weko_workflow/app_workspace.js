(function (angular) {
  // Bootstrap it!
  angular.element(document).ready(function() {
  angular.module('wekoRecords.controllers', []);

  function WekoRecordsCtrl($scope, $rootScope, $modal, InvenioRecordsAPI){
    ``/**
      * hook for check duplication file upload
      * @memberof WekoRecordsCtrl
      * @function hookAddFiles
      */
    $scope.hookAddFiles = function (files) {
      if (files !== null) {
        let duplicateFiles = [];
        files.forEach(function (file) {
          let duplicateFile = [];
          if ($rootScope.filesVM.files.length > 0) {
            duplicateFile = $rootScope.filesVM.files.filter(function (f) {
              return !f.is_thumbnail && f.key === file.name;
            });
          }
          if (duplicateFile.length === 0) {
            $rootScope.filesVM.addFiles([file]);
          } else {
            duplicateFiles.push(file.name);
          }
        });
        this.resetFilesPosition();

        // Generate error message and show modal
        if (duplicateFiles.length > 0) {
          let message = $("#duplicate_files_error").val() + '<br/><br/>';
          message += duplicateFiles.join(', ');
          $("#inputModal").html(message);
          $("#allModal").modal("show");
          return;
        }
      }
    }
  }
  })
})(angular);