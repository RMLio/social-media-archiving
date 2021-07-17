package io.fno.BeSocial;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.Date;
import java.util.Locale;
import java.text.SimpleDateFormat;
import okhttp3.HttpUrl;

import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.PathNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class BeSocialFunctions {

    private static final Logger logger = LoggerFactory.getLogger(BeSocialFunctions.class);

    public static List<String> dbpediaSpotlight(String text, String endpoint, Double confidence) {
        if (!text.equals("")) {
            try {
                String strUrl = endpoint + "/annotate?";
                strUrl += "text=" + URLEncoder.encode(text, "UTF-8");
                strUrl += "&confidence="+  String.valueOf(confidence);

                URL url = new URL(strUrl);
                HttpURLConnection con = (HttpURLConnection) url.openConnection();
                con.setRequestMethod("GET");
                con.setRequestProperty("Accept", "application/json");
                con.setInstanceFollowRedirects(true);

                BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
                String inputLine;
                StringBuilder content = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    content.append(inputLine);
                }

                in.close();
                con.disconnect();

                Object document = Configuration.defaultConfiguration().jsonProvider().parse(content.toString());
                return JsonPath.parse(document).read("$.Resources[*].@URI");
            } catch (PathNotFoundException e) {
                // that means no result was found, so that is fine
                logger.info(e.getMessage(), e);
            } catch (Exception e) {
                // that probably means smth is wrong with the DBpedia Spotlight endpoint, so that is fine: log and continue
                logger.warn(e.getMessage(), e);
            }
        }

        return new ArrayList<>();
    }

    public static String toXSDDateTime(String pattern, String value) {
        if (!pattern.equals("")) {

            try {
                SimpleDateFormat sf = new SimpleDateFormat(pattern, Locale.ENGLISH);
                sf.setLenient(true);
                
                Date date = sf.parse(value);
                SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
                return fmt.format(date);

            } catch (java.lang.IllegalArgumentException argE) {
                // One of the provided date patterns is invalid
                logger.warn(argE.getMessage(), argE);
            } catch (java.text.ParseException parseE) {
                // The provided date value could not be parsed
                logger.warn(parseE.getMessage(), parseE);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return new String("");
    }

}
