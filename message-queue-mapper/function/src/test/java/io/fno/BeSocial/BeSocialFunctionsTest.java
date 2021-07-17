package io.fno.BeSocial;
import org.junit.Test;
import org.hamcrest.CoreMatchers;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;

public class BeSocialFunctionsTest {

    @Test
    public void dbpediaSpotlight() {
        String endpoint = "https://api.dbpedia-spotlight.org/en";

        double confidence = .5;
        List<String> entities = BeSocialFunctions.dbpediaSpotlight("Barack Obama", endpoint, confidence);
        ArrayList<String> expected = new ArrayList<>();
        expected.add("http://dbpedia.org/resource/Barack_Obama");

        assertThat(entities, CoreMatchers.is(expected));

        entities = BeSocialFunctions.dbpediaSpotlight("", endpoint, confidence);
        expected = new ArrayList<>();

        assertThat(entities, CoreMatchers.is(expected));

        entities = BeSocialFunctions.dbpediaSpotlight("a", endpoint, confidence);
        expected = new ArrayList<>();

        assertThat(entities, CoreMatchers.is(expected));
    }

    @Test
    public void toXSDDateTimeCorrect() {
        // GIVEN a valid date pattern and a valid date
        String xsdDateTime = BeSocialFunctions.toXSDDateTime("EEE MMM dd HH:mm:ss ZZZZZ yyyy", "Wed Oct 10 20:19:24 +0000 2018");

        // THEN a correctly formatted xsd:dateTime should be returned
        assertThat(xsdDateTime, CoreMatchers.is("2018-10-10T22:19:24+0200"));
    }

    @Test
    public void toXSDDateTimeWrongInputPattern() {
        // GIVEN an invalid date pattern and a valid date
        String xsdDateTime = BeSocialFunctions.toXSDDateTime("ABC MMM dd HH:mm:ss ZZZZZ yyyy", "Wed Oct 10 20:19:24 +0000 2018");

        // THEN an empty string should be returned
        assertThat(xsdDateTime, CoreMatchers.is(""));
    }

    @Test
    public void toXSDDateTimeWrongInputValue() {
        // GIVEN a valid date pattern and an invalid date value
        String xsdDateTime = BeSocialFunctions.toXSDDateTime("EEE MMM dd HH:mm:ss ZZZZZ yyyy", "Abc Oct 10 20:19:24 +0000 2018");

        // THEN an empty string should be returned
        assertThat(xsdDateTime, CoreMatchers.is(""));
    }
}
