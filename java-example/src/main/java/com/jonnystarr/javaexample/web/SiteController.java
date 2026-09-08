package com.jonnystarr.javaexample.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
class SiteController {

    @GetMapping("/")
    String home() {
        return "home";
    }

    @GetMapping("/about")
    String about() {
        return "about";
    }
}
