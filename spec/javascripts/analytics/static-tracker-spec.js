describe("GOVUK.StaticTracker", function() {
  var tracker;

  beforeEach(function() {
    window._gaq = [];
    window.ga = function() {};
    spyOn(window, 'ga');
    spyOn(GOVUK.analyticsPlugins, 'printIntent');
    spyOn(GOVUK.analyticsPlugins, 'error');
    tracker = new GOVUK.StaticTracker({
      universalId: 'universal-id',
      classicId: 'classic-id',
      cookieDomain: '.www.gov.uk'
    });
  });

  describe('when created', function() {
    var universalSetupArguments;

    beforeEach(function() {
      universalSetupArguments = window.ga.calls.allArgs();
    });

    it('configures classic and universal trackers', function() {
      expect(window._gaq[0]).toEqual(['_setAccount', 'classic-id']);
      expect(window._gaq[1]).toEqual(['_setDomainName', '.www.gov.uk']);
      expect(universalSetupArguments[0]).toEqual(['create', 'universal-id', {'cookieDomain': '.www.gov.uk'}]);
    });

    it('sets the device pixel ratio', function() {
      expect(window._gaq[4][2]).toEqual('Pixel Ratio');
      expect(universalSetupArguments[2][1]).toEqual('dimension11');
    });

    it('sets the HTTP status code', function() {
      expect(window._gaq[5][2]).toEqual('httpStatusCode');
      expect(universalSetupArguments[3][1]).toEqual('dimension15');
    });

    it('tracks a pageview in both classic and universal', function() {
      expect(window._gaq[6]).toEqual(['_trackPageview']);
      expect(universalSetupArguments[4]).toEqual(['send', 'pageview']);
    });

    it('begins print tracking', function() {
      expect(GOVUK.analyticsPlugins.printIntent).toHaveBeenCalled();
    });

    it('begins error tracking', function() {
      expect(GOVUK.analyticsPlugins.error).toHaveBeenCalled();
    });

    describe('when there are govuk: meta tags', function() {
      beforeEach(function() {
        window.ga.calls.reset();
        window._gaq = [];
      });

      afterEach(function() {
        $('head').find('meta[name^="govuk:"]').remove();
      });

      it('sets them as dimensions', function() {

        $('head').append('\
          <meta name="govuk:section" content="section">\
          <meta name="govuk:format" content="format">\
          <meta name="govuk:need-ids" content="1,2,3">\
          <meta name="govuk:search-result-count" content="1000">\
          <meta name="govuk:publishing-government" content="2005-to-2010-labour-government">\
          <meta name="govuk:political-status" content="historic">\
          <meta name="govuk:analytics:organisations" content="<D10>">\
          <meta name="govuk:analytics:world-locations" content="<W1>">\
        ');

        tracker = new GOVUK.StaticTracker({universalId: 'universal-id', classicId: 'classic-id'});
        universalSetupArguments = window.ga.calls.allArgs();

        expect(window._gaq[6]).toEqual(['_setCustomVar', 1, 'Section', 'section', 3]);
        expect(universalSetupArguments[4]).toEqual(['set', 'dimension1', 'section']);

        expect(window._gaq[7]).toEqual(['_setCustomVar', 2, 'Format', 'format', 3]);
        expect(universalSetupArguments[5]).toEqual(['set', 'dimension2', 'format']);

        expect(window._gaq[8]).toEqual(['_setCustomVar', 3, 'NeedID', '1,2,3', 3]);
        expect(universalSetupArguments[6]).toEqual(['set', 'dimension3', '1,2,3']);

        expect(window._gaq[9]).toEqual(['_setCustomVar', 5, 'ResultCount', '1000', 3]);
        expect(universalSetupArguments[7]).toEqual(['set', 'dimension5', '1000']);

        expect(window._gaq[10]).toEqual(['_setCustomVar', 6, 'PublishingGovernment', '2005-to-2010-labour-government', 3]);
        expect(universalSetupArguments[8]).toEqual(['set', 'dimension6', '2005-to-2010-labour-government']);

        expect(window._gaq[11]).toEqual(['_setCustomVar', 7, 'PoliticalStatus', 'historic', 3]);
        expect(universalSetupArguments[9]).toEqual(['set', 'dimension7', 'historic']);

        expect(window._gaq[12]).toEqual(['_setCustomVar', 9, 'Organisations', '<D10>', 3]);
        expect(universalSetupArguments[10]).toEqual(['set', 'dimension9', '<D10>']);

        expect(window._gaq[13]).toEqual(['_setCustomVar', 10, 'WorldLocations', '<W1>', 3]);
        expect(universalSetupArguments[11]).toEqual(['set', 'dimension10', '<W1>']);
      });

      it('ignores meta tags not set', function() {

        $('head').append('<meta name="govuk:section" content="section">');

        tracker = new GOVUK.StaticTracker({universalId: 'universal-id', classicId: 'classic-id'});
        universalSetupArguments = window.ga.calls.allArgs();

        expect(window._gaq[6]).toEqual(['_setCustomVar', 1, 'Section', 'section', 3]);
        expect(universalSetupArguments[4]).toEqual(['set', 'dimension1', 'section']);

        expect(window._gaq[7]).toEqual(['_trackPageview']);
        expect(universalSetupArguments[5]).toEqual(['send', 'pageview']);
      });
    });
  });

  describe('when tracking pageviews, events and custom dimensions', function() {
    it('tracks in both classic and universal', function() {
      window._gaq = [];
      tracker.trackPageview('/path', 'Title');
      expect(window._gaq[0]).toEqual(['_trackPageview', '/path']);
      expect(window.ga.calls.mostRecent().args).toEqual(['send', 'pageview', {page: '/path', title: 'Title'}]);

      window._gaq = [];
      tracker.trackEvent('category', 'action');
      expect(window._gaq[0]).toEqual(['_trackEvent', 'category', 'action']);
      expect(window.ga.calls.mostRecent().args).toEqual(['send', {hitType: 'event', eventCategory: 'category', eventAction: 'action'}]);

      window._gaq = [];
      tracker.setSectionDimension('value');
      expect(window._gaq[0]).toEqual(['_setCustomVar', 1, 'Section', 'value', 3]);
      expect(window.ga.calls.mostRecent().args).toEqual(['set', 'dimension1', 'value']);
    });
  });

  describe('when tracking social media shares', function() {
    it('tracks in both classic and universal', function() {
      window._gaq = [];
      tracker.trackShare('network');

      expect(window._gaq[0]).toEqual(['_trackSocial', 'network', 'share', jasmine.any(String)]);
      expect(window.ga.calls.mostRecent().args).toEqual(['send', {
        hitType: 'social',
        socialNetwork: 'network',
        socialAction: 'share',
        socialTarget: jasmine.any(String)
      }]);
    });
  });

  describe('when setting a method to call on a following page', function() {
    beforeEach(function() {
      spyOn(GOVUK, 'cookie');
    });

    describe('and the method exists', function() {
      it('sets a cookie with the method name', function() {
        tracker.callOnNextPage('trackPageview');
        expect(GOVUK.cookie).toHaveBeenCalledWith('analytics_next_page_call', '["trackPageview"]');
      });

      it('sets a cookie with the parameters to call', function() {
        tracker.callOnNextPage('trackPageview', ['/path', 'Custom Title']);
        expect(GOVUK.cookie).toHaveBeenCalledWith('analytics_next_page_call', '["trackPageview","/path","Custom Title"]');
      });

      it('sets a cookie with the single parameter to call', function() {
        tracker.callOnNextPage('trackPageview', '/path');
        expect(GOVUK.cookie).toHaveBeenCalledWith('analytics_next_page_call', '["trackPageview","/path"]');
      });
    });

    describe('and the method doesn’t exist', function() {
      it('no cookie is set', function() {
        tracker.callOnNextPage('trackPageviewToNowhere');
        expect(GOVUK.cookie).not.toHaveBeenCalled();
      });
    });
  });

  describe('when there is a cookie indicating a method to call', function() {
    beforeEach(function() {
      spyOn(tracker, 'trackPageview');
    });

    it('calls the method', function() {
      spyOn(GOVUK, 'cookie').and.returnValue('["trackPageview"]');
      tracker.callMethodRequestedByPreviousPage();
      expect(tracker.trackPageview).toHaveBeenCalledWith();
    });

    it('calls the method with given parameters', function() {
      spyOn(GOVUK, 'cookie').and.returnValue('["trackPageview","/path","Title"]');
      tracker.callMethodRequestedByPreviousPage();
      expect(tracker.trackPageview).toHaveBeenCalledWith('/path', 'Title');
    });
  });
});
