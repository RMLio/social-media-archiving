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
}
