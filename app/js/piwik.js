//Piwik
var _paq = _paq || [];
function piwik()
{
        try
        {
          var mid="";
          mid = getUser().mid;
          if( mid == null )
          {
                mid="";
          }
          
          _paq.push(["setCustomVariable", 2, "guid", "$guid", "visit"]);
          
          _paq.push(["setCustomVariable", 1, "userid", mid, "visit"]);
          
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          (function()
          {
            var isHttps = ("https:" == document.location.protocol) ? true:false;
            var u = (isHttps ? "https" : "http") + "://analytics.nonobank.com:" + (isHttps?"7443":"7000") +  "/piwik/";
            _paq.push(['setTrackerUrl', u+'piwik.php']);
            _paq.push(['setSiteId', 4]);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript';
            g.defer=true; g.async=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
          })();
          
        }
        catch(ex)
        {
               try
               {
                        _paq.push(["setCustomVariable", 2, "guid", "$guid", "visit"]);
                         
                         _paq.push(["setCustomVariable", 1, "userid", "", "visit"]);
                         
                         _paq.push(['trackPageView']);
                         _paq.push(['enableLinkTracking']);
                         (function()
                         {
                           var isHttps = ("https:" == document.location.protocol) ? true:false;
                           var u = (isHttps ? "https" : "http") + "://analytics.nonobank.com:" + (isHttps?"7443":"7000") +  "/piwik/";
                           _paq.push(['setTrackerUrl', u+'piwik.php']);
                           _paq.push(['setSiteId', 4]);
                           var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript';
                           g.defer=true; g.async=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
                         })();
                }
               catch(ex)
               {
                 document.write("<img src='http://analytics.nonobank.com:7000/piwik/piwik.php?idsite=4' style='display:none;'/>");
                }
        }
}

piwik();
