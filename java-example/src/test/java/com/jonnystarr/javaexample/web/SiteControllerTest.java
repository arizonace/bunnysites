package com.jonnystarr.javaexample.web;

import jakarta.servlet.RequestDispatcher;
import com.jonnystarr.javaexample.JavaExampleApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest({SiteController.class, HealthController.class, SiteErrorController.class})
@Import(JavaExampleApplication.class)
class SiteControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void homePageRenders() throws Exception {
        mvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(view().name("home"))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("Calm by default")));
    }

    @Test
    void aboutPageRenders() throws Exception {
        mvc.perform(get("/about"))
            .andExpect(status().isOk())
            .andExpect(view().name("about"))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("Built for the handoff")));
    }

    @Test
    void healthEndpointReportsUp() throws Exception {
        mvc.perform(get("/health").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.service").value("java-example"));
    }

    @Test
    void notFoundErrorUsesTheFriendlyTemplate() throws Exception {
        mvc.perform(get("/error").requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 404))
            .andExpect(status().isOk())
            .andExpect(view().name("error/404"))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("This page slipped between the lines")));
    }
}
