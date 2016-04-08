var fs = Npm.require('fs');
var csv = Npm.require('csv');

Meteor.startup(function(){

  function importHubs() {

    Async.runSync(function(doneImportHubs){
      rs = fs.createReadStream(process.env.PWD +'/data/hubs.csv');
      var parser = csv.parse({columns: true}, function(err, data){
        if (err) return doneImportHubs(err);
        hubs = data;
        doneImportHubs();
      });
      rs.pipe(parser);
    });

    // variable to keep hub names and ids
    var hubNamesToIds = {};

    // import basic properties
    for ( let i = 0; i < hubs.length; i++ ) {
      var item = _.pick(hubs[i], 'name', 'description_en', 'description_pt', 'description_es', 'incidencyReach', 'nature', 'website', 'city');

      var placesOfOriginIds = hubs[i].placesOfOriginIds;
      if (placesOfOriginIds) {
        item.placesOfOrigin = placesOfOriginIds.split(',');
      }

      item.nature = Natures.findOne({en: item.nature})._id;
      hubNamesToIds[item.name] = Hubs.insert(item);
    }

    // set hub relations
    for ( let i = 0; i < hubs.length; i++ ) {
      var hubId = hubNamesToIds[hubs[i].name];

      var relatedHubsNames = hubs[i].relatedHubsNames;
      var relatedHubsIds = [];
      if (relatedHubsNames) {
        relatedHubsNames = relatedHubsNames.split(';');
        _.each(relatedHubsNames, function(hubName){
          var hubId = hubNamesToIds[hubName.trim()];
          if (hubId) relatedHubsIds.push(hubId);
        });
      }

      var parentHubNames = hubs[i].parentHubNames;
      var parentHubIds = [];
      if (parentHubNames) {
        parentHubNames = parentHubNames.split(';');
        _.each(parentHubNames, function(hubName){
          var hubId = hubNamesToIds[hubName.trim()];
          if (hubId) parentHubIds.push(hubId);
        });
      }

      Hubs.update({_id: hubId}, {
        $set: {
          relatedHubs: relatedHubsIds,
          parentHubs: parentHubIds
        }
      });
    }
  }

  function importOrigins() {
    var origins;

    Origins.remove({});

    Async.runSync(function(doneImportOrigins){
      rs = fs.createReadStream(process.env.PWD +'/data/origins.csv');
      var parser = csv.parse({columns: true}, function(err, data){
        if (err) return doneImportOrigins(err);
        origins = data;
        doneImportOrigins();
      });
      rs.pipe(parser);
    });

    _.each(origins, function(country){
      Origins.insert(country);
    });
  }

  function importNatures() {
    var natures;

    Async.runSync(function(doneImportNatures){
      rs = fs.createReadStream(process.env.PWD +'/data/natures.csv');
      var parser = csv.parse({columns: true}, function(err, data){
        if (err) return doneImportNatures(err);
        natures = data;
        doneImportNatures();
      });
      rs.pipe(parser);
    });

    _.each(natures, function(nature){
      Natures.insert(nature);
    });
  }

  function importThemes() {
    var themes;

    Async.runSync(function(doneImportThemes){
      rs = fs.createReadStream(process.env.PWD +'/data/themes.csv');
      var parser = csv.parse({columns: true}, function(err, data){
        if (err) return doneImportThemes(err);
        themes = data;
        doneImportThemes();
      });
      rs.pipe(parser);
    });

    _.each(themes, function(theme){
      Themes.insert(theme);
    });
  }

  function importMethodsAndMechanisms() {
    var methods;

    Async.runSync(function(doneImportMethods){
      rs = fs.createReadStream(process.env.PWD +'/data/methods.csv');
      var parser = csv.parse({columns: true}, function(err, data){
        if (err) return doneImportMethods(err);
        methods = data;
        doneImportMethods();
      });
      rs.pipe(parser);
    });

    var methodIds = {};
    _.each(methods, function(method){
      methodIds[method.pt] = Methods.insert(method);
    });

    var mechanisms;

    Async.runSync(function(doneImportMechanisms){
      rs = fs.createReadStream(process.env.PWD +'/data/mechanisms.csv');
      var parser = csv.parse({columns: true}, function(err, data){
        if (err) return doneImportMechanisms(err);
        mechanisms = data;
        doneImportMechanisms();
      });
      rs.pipe(parser);
    });

    _.each(mechanisms, function(mechanism){
      mechanism.method = methodIds[mechanism.method];
      Mechanisms.insert(mechanism);
    });
  }

  if (Origins.find({}).count() == 0) importOrigins();
  if (Natures.find({}).count() == 0) importNatures();
  if (Hubs.find({}).count() == 0) importHubs();
  if (Themes.find({}).count() == 0) importThemes();
  if (Methods.find({}).count() == 0) importMethodsAndMechanisms();

});
