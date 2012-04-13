// Generated by CoffeeScript 1.3.1
(function() {
  var box, load, mergeObj, oneEightyOverPi,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  load = function(opts, callback) {
    var k, kvps, url, v, xhr;
    url = opts.url;
    if (opts.method == null) {
      opts.method = 'GET';
    }
    if (opts.search != null) {
      kvps = (function() {
        var _ref, _results;
        _ref = opts.search;
        _results = [];
        for (k in _ref) {
          if (!__hasProp.call(_ref, k)) continue;
          v = _ref[k];
          _results.push("" + (escape(k)) + "=" + (escape(v)));
        }
        return _results;
      })();
      url += '?' + kvps.join('&');
    }
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      var obj;
      if (xhr.readyState === 4) {
        obj = opts.type === 'json' ? JSON.parse(xhr.responseText) : opts.type === 'xml' ? xhr.responseXML : xhr.responseText;
        return callback(obj);
      }
    };
    xhr.open(opts.method, url, true);
    return xhr.send(opts.data);
  };

  mergeObj = function(o1, o2) {
    var k, v;
    for (k in o2) {
      if (!__hasProp.call(o2, k)) continue;
      v = o2[k];
      o1[k] = v;
    }
    return o1;
  };

  oneEightyOverPi = 180 / Math.PI;

  box = null;

  this.FeatureManager = (function() {

    FeatureManager.name = 'FeatureManager';

    function FeatureManager(ge, lonRatio, cam, params) {
      this.ge = ge;
      this.lonRatio = lonRatio;
      this.cam = cam;
      this.params = params;
      this.featureTree = new RTree(10);
      this.visibleFeatures = {};
      this.updateMoment = 0;
    }

    FeatureManager.prototype.addFeature = function(f) {
      f.fm = this;
      return this.featureTree.insert(f.rect(), f);
    };

    FeatureManager.prototype.removeFeature = function(f) {
      this.hideFeature(f);
      this.featureTree.remove(f.rect(), f);
      return delete f.fm;
    };

    FeatureManager.prototype.showFeature = function(f) {
      if (this.visibleFeatures[f.id] != null) {
        return false;
      }
      this.visibleFeatures[f.id] = f;
      f.show();
      return true;
    };

    FeatureManager.prototype.hideFeature = function(f) {
      if (this.visibleFeatures[f.id] == null) {
        return false;
      }
      delete this.visibleFeatures[f.id];
      f.hide();
      return true;
    };

    FeatureManager.prototype.featuresInBBox = function(lat1, lon1, lat2, lon2) {
      return this.featureTree.search({
        x: lon1,
        y: lat1,
        w: lon2 - lon1,
        h: lat2 - lat1
      });
    };

    FeatureManager.prototype.update = function() {
      var cam, f, id, kml, lat1, lat2, latDiff, latSize, lon1, lon2, lonDiff, lonSize, lookAt, lookLat, lookLon, midLat, midLon, sizeFactor, _i, _len, _ref, _ref1;
      cam = this.cam;
      lookAt = this.ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE);
      lookLat = lookAt.getLatitude();
      lookLon = lookAt.getLongitude();
      midLat = (cam.lat + lookLat) / 2;
      midLon = (cam.lon + lookLon) / 2;
      latDiff = Math.abs(cam.lat - midLat);
      lonDiff = Math.abs(cam.lon - midLon);
      sizeFactor = 1.1;
      latSize = Math.max(latDiff, lonDiff / this.lonRatio) * sizeFactor;
      lonSize = latSize * this.lonRatio;
      lat1 = midLat - latSize;
      lat2 = midLat + latSize;
      lon1 = midLon - lonSize;
      lon2 = midLon + lonSize;
      if (this.params.debugBox) {
        if (box) {
          this.ge.getFeatures().removeChild(box);
        }
        kml = "<?xml version='1.0' encoding='UTF-8'?><kml xmlns='http://www.opengis.net/kml/2.2'><Document><Placemark><name>lookAt</name><Point><coordinates>" + lookLon + "," + lookLat + ",0</coordinates></Point></Placemark><Placemark><name>camera</name><Point><coordinates>" + cam.lon + "," + cam.lat + ",0</coordinates></Point></Placemark><Placemark><name>middle</name><Point><coordinates>" + midLon + "," + midLat + ",0</coordinates></Point></Placemark><Placemark><LineString><altitudeMode>absolute</altitudeMode><coordinates>" + lon1 + "," + lat1 + ",100 " + lon1 + "," + lat2 + ",100 " + lon2 + "," + lat2 + ",100 " + lon2 + "," + lat1 + ",50 " + lon1 + "," + lat1 + ",100</coordinates></LineString></Placemark></Document></kml>";
        box = this.ge.parseKml(kml);
        this.ge.getFeatures().appendChild(box);
      }
      _ref = this.featuresInBBox(lat1, lon1, lat2, lon2);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        this.showFeature(f);
        f.updateMoment = this.updateMoment;
      }
      _ref1 = this.visibleFeatures;
      for (id in _ref1) {
        if (!__hasProp.call(_ref1, id)) continue;
        f = _ref1[id];
        if (f.updateMoment < this.updateMoment) {
          this.hideFeature(f);
        }
      }
      return this.updateMoment += 1;
    };

    return FeatureManager;

  })();

  this.FeatureSet = (function() {

    FeatureSet.name = 'FeatureSet';

    function FeatureSet(featureManager) {
      this.featureManager = featureManager;
      window.f = this.features = {};
    }

    FeatureSet.prototype.addFeature = function(f) {
      this.features[f.id] = f;
      return this.featureManager.addFeature(f);
    };

    FeatureSet.prototype.removeFeature = function(f) {
      this.featureManager.removeFeature(f);
      return delete this.features[f.id];
    };

    FeatureSet.prototype.clearFeatures = function() {
      var f, k, _ref, _results;
      _ref = this.features;
      _results = [];
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        f = _ref[k];
        _results.push(this.removeFeature(f));
      }
      return _results;
    };

    return FeatureSet;

  })();

  this.Feature = (function() {

    Feature.name = 'Feature';

    Feature.prototype.alt = 100;

    Feature.prototype.nameTextOpts = {};

    Feature.prototype.descTextOpts = {};

    function Feature(id, lat, lon) {
      this.id = id;
      this.lat = lat;
      this.lon = lon;
    }

    Feature.prototype.rect = function() {
      return {
        x: this.lon,
        y: this.lat,
        w: 0,
        h: 0
      };
    };

    Feature.prototype.show = function() {
      var angleToCamDeg, angleToCamRad, cam, fm, ge, geNode, st;
      fm = this.fm;
      cam = fm.cam;
      ge = fm.ge;
      angleToCamRad = Math.atan2(this.lon - cam.lon, this.lat - cam.lat);
      angleToCamDeg = angleToCamRad * oneEightyOverPi;
      st = new SkyText(this.lat, this.lon, this.alt);
      if (this.name) {
        st.text(this.name, mergeObj({
          bearing: angleToCamDeg
        }, this.nameTextOpts));
      }
      if (this.desc) {
        st.text(this.desc, mergeObj({
          bearing: angleToCamDeg
        }, this.descTextOpts));
      }
      geNode = ge.parseKml(st.kml());
      ge.getFeatures().appendChild(geNode);
      this.hide();
      return this.geNode = geNode;
    };

    Feature.prototype.hide = function() {
      if (this.geNode != null) {
        this.fm.ge.getFeatures().removeChild(this.geNode);
        return delete this.geNode;
      }
    };

    return Feature;

  })();

  this.RailStationSet = (function(_super) {

    __extends(RailStationSet, _super);

    RailStationSet.name = 'RailStationSet';

    function RailStationSet(featureManager) {
      var code, lat, lon, name, row, station, _i, _len, _ref, _ref1;
      RailStationSet.__super__.constructor.call(this, featureManager);
      _ref = this.csv.split("\n");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        _ref1 = row.split(','), code = _ref1[0], name = _ref1[1], lat = _ref1[2], lon = _ref1[3];
        station = new RailStation("rail-" + code, parseFloat(lat), parseFloat(lon));
        station.name = "\uF001 " + name;
        this.addFeature(station);
      }
    }

    return RailStationSet;

  })(FeatureSet);

  this.RailStation = (function(_super) {

    __extends(RailStation, _super);

    RailStation.name = 'RailStation';

    function RailStation() {
      return RailStation.__super__.constructor.apply(this, arguments);
    }

    RailStation.prototype.alt = 130;

    RailStation.prototype.nameTextOpts = {
      size: 3
    };

    return RailStation;

  })(Feature);

  this.TubeStationSet = (function(_super) {

    __extends(TubeStationSet, _super);

    TubeStationSet.name = 'TubeStationSet';

    function TubeStationSet(featureManager) {
      var code, dummy, lat, lon, name, row, station, _i, _len, _ref, _ref1;
      TubeStationSet.__super__.constructor.call(this, featureManager);
      _ref = this.csv.split("\n");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        _ref1 = row.split(','), code = _ref1[0], dummy = _ref1[1], lon = _ref1[2], lat = _ref1[3], name = _ref1[4];
        station = new TubeStation("tube-" + code, parseFloat(lat), parseFloat(lon));
        station.name = "\uF000 " + name;
        this.addFeature(station);
      }
    }

    return TubeStationSet;

  })(FeatureSet);

  this.TubeStation = (function(_super) {

    __extends(TubeStation, _super);

    TubeStation.name = 'TubeStation';

    function TubeStation() {
      return TubeStation.__super__.constructor.apply(this, arguments);
    }

    TubeStation.prototype.alt = 100;

    TubeStation.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 1
    };

    return TubeStation;

  })(Feature);

  this.MiscSet = (function(_super) {

    __extends(MiscSet, _super);

    MiscSet.name = 'MiscSet';

    function MiscSet(featureManager) {
      var bb, conf, logo;
      MiscSet.__super__.constructor.call(this, featureManager);
      logo = new CASALogo("casa-logo", 51.52192375643773, -0.13593167066574097);
      this.addFeature(logo);
      conf = new CASAConf('casa-conf', 51.5210609212573, -0.1287245750427246);
      conf.update();
      this.addFeature(conf);
      bb = new BigBen('big-ben', 51.5007286626542, -0.12459531426429749);
      bb.update();
      this.addFeature(bb);
    }

    return MiscSet;

  })(FeatureSet);

  this.CASALogo = (function(_super) {

    __extends(CASALogo, _super);

    CASALogo.name = 'CASALogo';

    function CASALogo() {
      return CASALogo.__super__.constructor.apply(this, arguments);
    }

    CASALogo.prototype.alt = 220;

    CASALogo.prototype.nameTextOpts = {
      size: 1,
      lineWidth: 1
    };

    CASALogo.prototype.name = "\uF002";

    return CASALogo;

  })(Feature);

  this.CASAConf = (function(_super) {

    __extends(CASAConf, _super);

    CASAConf.name = 'CASAConf';

    function CASAConf() {
      return CASAConf.__super__.constructor.apply(this, arguments);
    }

    CASAConf.prototype.alt = 130;

    CASAConf.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 2
    };

    CASAConf.prototype.descTextOpts = {
      size: 1,
      lineWidth: 1
    };

    CASAConf.prototype.name = 'CASA Smart Cities';

    CASAConf.prototype.update = function() {
      var changed, d, d0, dayHrs, dayMs, desc, i, self, session, _i, _len, _ref;
      d = new Date();
      d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      dayMs = d - d0;
      dayHrs = dayMs / 1000 / 60 / 60;
      _ref = this.schedule;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        session = _ref[i];
        if (dayHrs < session[0]) {
          desc = "Now:\t" + this.schedule[i - 1][1] + "\nNext:\t" + session[1];
          break;
        }
      }
      changed = this.desc !== desc;
      this.desc = desc;
      if (changed && (this.geNode != null)) {
        this.show();
      }
      self = arguments.callee.bind(this);
      if (this.interval == null) {
        return this.interval = setInterval(self, 1 * 60 * 1000);
      }
    };

    return CASAConf;

  })(Feature);

  this.BigBen = (function(_super) {

    __extends(BigBen, _super);

    BigBen.name = 'BigBen';

    function BigBen() {
      return BigBen.__super__.constructor.apply(this, arguments);
    }

    BigBen.prototype.alt = 200;

    BigBen.prototype.nameTextOpts = {
      size: 3,
      lineWidth: 3
    };

    BigBen.prototype.update = function() {
      var self;
      this.name = new Date().strftime('%H.%M');
      if (this.geNode != null) {
        this.show();
      }
      self = arguments.callee.bind(this);
      if (this.interval == null) {
        return this.interval = setInterval(self, 1 * 60 * 1000);
      }
    };

    return BigBen;

  })(Feature);

  this.LondonTweetSet = (function(_super) {
    var lineChars;

    __extends(LondonTweetSet, _super);

    LondonTweetSet.name = 'LondonTweetSet';

    lineChars = 35;

    function LondonTweetSet(featureManager) {
      LondonTweetSet.__super__.constructor.call(this, featureManager);
      this.update();
    }

    LondonTweetSet.prototype.update = function() {
      var self,
        _this = this;
      load({
        url: 'http://www.casa.ucl.ac.uk/tom/ajax-live/lon_last_hour.json',
        type: 'json'
      }, function(data) {
        var dedupedTweets, i, k, t, tweet, _i, _len, _ref, _results;
        _this.clearFeatures();
        dedupedTweets = {};
        _ref = data.results.reverse();
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          t = _ref[i];
          dedupedTweets["" + t.lat + "/" + t.lon] = t;
        }
        _results = [];
        for (k in dedupedTweets) {
          if (!__hasProp.call(dedupedTweets, k)) continue;
          t = dedupedTweets[k];
          tweet = new Tweet("tweet-" + t.twitterID, parseFloat(t.lat), parseFloat(t.lon));
          tweet.name = "@" + t.name + " — " + (t.dateT.split(' ')[1]);
          tweet.desc = t.twitterPost.match(/.{1,35}(\s|$)|\S+?(\s|$)/g).join('\n');
          _results.push(_this.addFeature(tweet));
        }
        return _results;
      });
      self = arguments.callee.bind(this);
      return setTimeout(self, 5 * 60 * 1000);
    };

    return LondonTweetSet;

  })(FeatureSet);

  this.Tweet = (function(_super) {

    __extends(Tweet, _super);

    Tweet.name = 'Tweet';

    function Tweet() {
      return Tweet.__super__.constructor.apply(this, arguments);
    }

    Tweet.prototype.alt = 160;

    Tweet.prototype.nameTextOpts = {
      size: 1
    };

    Tweet.prototype.descTextOpts = {
      size: 1,
      lineWidth: 1
    };

    return Tweet;

  })(Feature);

}).call(this);
