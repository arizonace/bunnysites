package com.jonnystarr.javaexample.web;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
class SiteErrorController implements ErrorController {

    @RequestMapping("/error")
    String error(HttpServletRequest request, Model model) {
        Object statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int code = statusCode instanceof Integer value ? value : HttpStatus.INTERNAL_SERVER_ERROR.value();

        model.addAttribute("status", code);
        return code == HttpStatus.NOT_FOUND.value() ? "error/404" : "error/500";
    }
}
