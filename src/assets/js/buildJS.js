jQuery(document).ready(function() {
  if (typeof edButtons !== "undefined") {
    edButtons[110] = new QTags.TagButton("code", "code", "`", "`", "c");
    QTags._buttonsInit();
  }
  jQuery("#bbp_topic_title").bind("keydown.editor-focus", function(e) {
    if (e.which !== 9) return;
    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
      if (typeof tinymce !== "undefined") {
        if (!tinymce.activeEditor.isHidden()) {
          var editor = tinymce.activeEditor.editorContainer;
          jQuery("#" + editor + " td.mceToolbar > a").focus();
        } else {
          jQuery("textarea.bbp-the-content").focus();
        }
      } else {
        jQuery("textarea.bbp-the-content").focus();
      }
      e.preventDefault();
    }
  });
  jQuery("#bbp_topic_tags").bind("keydown.editor-focus", function(e) {
    if (e.which !== 9) return;
    if (e.shiftKey && !e.ctrlKey && !e.altKey) {
      if (typeof tinymce !== "undefined") {
        if (!tinymce.activeEditor.isHidden()) {
          var editor = tinymce.activeEditor.editorContainer;
          jQuery("#" + editor + " td.mceToolbar > a").focus();
        } else {
          jQuery("textarea.bbp-the-content").focus();
        }
      } else {
        jQuery("textarea.bbp-the-content").focus();
      }
      e.preventDefault();
    }
  });
});
(function($) {
  "use strict";
  if (typeof wpcf7 === "undefined" || wpcf7 === null) {
    return;
  }
  wpcf7 = $.extend(
    {
      cached: 0,
      inputs: []
    },
    wpcf7
  );
  $(function() {
    wpcf7.supportHtml5 = (function() {
      var features = {};
      var input = document.createElement("input");
      features.placeholder = "placeholder" in input;
      var inputTypes = ["email", "url", "tel", "number", "range", "date"];
      $.each(inputTypes, function(index, value) {
        input.setAttribute("type", value);
        features[value] = input.type !== "text";
      });
      return features;
    })();
    $("div.wpcf7 > form").each(function() {
      var $form = $(this);
      wpcf7.initForm($form);
      if (wpcf7.cached) {
        wpcf7.refill($form);
      }
    });
  });
  wpcf7.getId = function(form) {
    return parseInt($('input[name="_wpcf7"]', form).val(), 10);
  };
  wpcf7.initForm = function(form) {
    var $form = $(form);
    $form.submit(function(event) {
      if (!wpcf7.supportHtml5.placeholder) {
        $("[placeholder].placeheld", $form).each(function(i, n) {
          $(n)
            .val("")
            .removeClass("placeheld");
        });
      }
      if (typeof window.FormData === "function") {
        wpcf7.submit($form);
        event.preventDefault();
      }
    });
    $(".wpcf7-submit", $form).after('<span class="ajax-loader"></span>');
    wpcf7.toggleSubmit($form);
    $form.on("click", ".wpcf7-acceptance", function() {
      wpcf7.toggleSubmit($form);
    });
    $(".wpcf7-exclusive-checkbox", $form).on(
      "click",
      "input:checkbox",
      function() {
        var name = $(this).attr("name");
        $form
          .find('input:checkbox[name="' + name + '"]')
          .not(this)
          .prop("checked", false);
      }
    );
    $(".wpcf7-list-item.has-free-text", $form).each(function() {
      var $freetext = $(":input.wpcf7-free-text", this);
      var $wrap = $(this).closest(".wpcf7-form-control");
      if ($(":checkbox, :radio", this).is(":checked")) {
        $freetext.prop("disabled", false);
      } else {
        $freetext.prop("disabled", true);
      }
      $wrap.on("change", ":checkbox, :radio", function() {
        var $cb = $(".has-free-text", $wrap).find(":checkbox, :radio");
        if ($cb.is(":checked")) {
          $freetext.prop("disabled", false).focus();
        } else {
          $freetext.prop("disabled", true);
        }
      });
    });
    if (!wpcf7.supportHtml5.placeholder) {
      $("[placeholder]", $form).each(function() {
        $(this).val($(this).attr("placeholder"));
        $(this).addClass("placeheld");
        $(this).focus(function() {
          if ($(this).hasClass("placeheld")) {
            $(this)
              .val("")
              .removeClass("placeheld");
          }
        });
        $(this).blur(function() {
          if ("" === $(this).val()) {
            $(this).val($(this).attr("placeholder"));
            $(this).addClass("placeheld");
          }
        });
      });
    }
    if (wpcf7.jqueryUi && !wpcf7.supportHtml5.date) {
      $form.find('input.wpcf7-date[type="date"]').each(function() {
        $(this).datepicker({
          dateFormat: "yy-mm-dd",
          minDate: new Date($(this).attr("min")),
          maxDate: new Date($(this).attr("max"))
        });
      });
    }
    if (wpcf7.jqueryUi && !wpcf7.supportHtml5.number) {
      $form.find('input.wpcf7-number[type="number"]').each(function() {
        $(this).spinner({
          min: $(this).attr("min"),
          max: $(this).attr("max"),
          step: $(this).attr("step")
        });
      });
    }
    $(".wpcf7-character-count", $form).each(function() {
      var $count = $(this);
      var name = $count.attr("data-target-name");
      var down = $count.hasClass("down");
      var starting = parseInt($count.attr("data-starting-value"), 10);
      var maximum = parseInt($count.attr("data-maximum-value"), 10);
      var minimum = parseInt($count.attr("data-minimum-value"), 10);
      var updateCount = function(target) {
        var $target = $(target);
        var length = $target.val().length;
        var count = down ? starting - length : length;
        $count.attr("data-current-value", count);
        $count.text(count);
        if (maximum && maximum < length) {
          $count.addClass("too-long");
        } else {
          $count.removeClass("too-long");
        }
        if (minimum && length < minimum) {
          $count.addClass("too-short");
        } else {
          $count.removeClass("too-short");
        }
      };
      $(':input[name="' + name + '"]', $form).each(function() {
        updateCount(this);
        $(this).keyup(function() {
          updateCount(this);
        });
      });
    });
    $form.on("change", ".wpcf7-validates-as-url", function() {
      var val = $.trim($(this).val());
      if (
        val &&
        !val.match(/^[a-z][a-z0-9.+-]*:/i) &&
        -1 !== val.indexOf(".")
      ) {
        val = val.replace(/^\/+/, "");
        val = "http://" + val;
      }
      $(this).val(val);
    });
  };
  wpcf7.submit = function(form) {
    if (typeof window.FormData !== "function") {
      return;
    }
    var $form = $(form);
    $(".ajax-loader", $form).addClass("is-active");
    wpcf7.clearResponse($form);
    var formData = new FormData($form.get(0));
    var detail = {
      id: $form.closest("div.wpcf7").attr("id"),
      status: "init",
      inputs: [],
      formData: formData
    };
    $.each($form.serializeArray(), function(i, field) {
      if ("_wpcf7" == field.name) {
        detail.contactFormId = field.value;
      } else if ("_wpcf7_version" == field.name) {
        detail.pluginVersion = field.value;
      } else if ("_wpcf7_locale" == field.name) {
        detail.contactFormLocale = field.value;
      } else if ("_wpcf7_unit_tag" == field.name) {
        detail.unitTag = field.value;
      } else if ("_wpcf7_container_post" == field.name) {
        detail.containerPostId = field.value;
      } else if (field.name.match(/^_wpcf7_\w+_free_text_/)) {
        var owner = field.name.replace(/^_wpcf7_\w+_free_text_/, "");
        detail.inputs.push({
          name: owner + "-free-text",
          value: field.value
        });
      } else if (field.name.match(/^_/)) {
      } else {
        detail.inputs.push(field);
      }
    });
    wpcf7.triggerEvent($form.closest("div.wpcf7"), "beforesubmit", detail);
    var ajaxSuccess = function(data, status, xhr, $form) {
      detail.id = $(data.into).attr("id");
      detail.status = data.status;
      detail.apiResponse = data;
      var $message = $(".wpcf7-response-output", $form);
      switch (data.status) {
        case "validation_failed":
          $.each(data.invalidFields, function(i, n) {
            $(n.into, $form).each(function() {
              wpcf7.notValidTip(this, n.message);
              $(".wpcf7-form-control", this).addClass("wpcf7-not-valid");
              $("[aria-invalid]", this).attr("aria-invalid", "true");
            });
          });
          $message.addClass("wpcf7-validation-errors");
          $form.addClass("invalid");
          wpcf7.triggerEvent(data.into, "invalid", detail);
          break;
        case "acceptance_missing":
          $message.addClass("wpcf7-acceptance-missing");
          $form.addClass("unaccepted");
          wpcf7.triggerEvent(data.into, "unaccepted", detail);
          break;
        case "spam":
          $message.addClass("wpcf7-spam-blocked");
          $form.addClass("spam");
          $('[name="g-recaptcha-response"]', $form).each(function() {
            if ("" === $(this).val()) {
              var $recaptcha = $(this).closest(".wpcf7-form-control-wrap");
              wpcf7.notValidTip($recaptcha, wpcf7.recaptcha.messages.empty);
            }
          });
          wpcf7.triggerEvent(data.into, "spam", detail);
          break;
        case "aborted":
          $message.addClass("wpcf7-aborted");
          $form.addClass("aborted");
          wpcf7.triggerEvent(data.into, "aborted", detail);
          break;
        case "mail_sent":
          $message.addClass("wpcf7-mail-sent-ok");
          $form.addClass("sent");
          wpcf7.triggerEvent(data.into, "mailsent", detail);
          break;
        case "mail_failed":
          $message.addClass("wpcf7-mail-sent-ng");
          $form.addClass("failed");
          wpcf7.triggerEvent(data.into, "mailfailed", detail);
          break;
        default:
          var customStatusClass =
            "custom-" + data.status.replace(/[^0-9a-z]+/i, "-");
          $message.addClass("wpcf7-" + customStatusClass);
          $form.addClass(customStatusClass);
      }
      wpcf7.refill($form, data);
      wpcf7.triggerEvent(data.into, "submit", detail);
      if ("mail_sent" == data.status) {
        $form.each(function() {
          this.reset();
        });
        wpcf7.toggleSubmit($form);
      }
      if (!wpcf7.supportHtml5.placeholder) {
        $form.find("[placeholder].placeheld").each(function(i, n) {
          $(n).val($(n).attr("placeholder"));
        });
      }
      $message
        .html("")
        .append(data.message)
        .slideDown("fast");
      $message.attr("role", "alert");
      $(".screen-reader-response", $form.closest(".wpcf7")).each(function() {
        var $response = $(this);
        $response
          .html("")
          .attr("role", "")
          .append(data.message);
        if (data.invalidFields) {
          var $invalids = $("<ul></ul>");
          $.each(data.invalidFields, function(i, n) {
            if (n.idref) {
              var $li = $("<li></li>").append(
                $("<a></a>")
                  .attr("href", "#" + n.idref)
                  .append(n.message)
              );
            } else {
              var $li = $("<li></li>").append(n.message);
            }
            $invalids.append($li);
          });
          $response.append($invalids);
        }
        $response.attr("role", "alert").focus();
      });
    };
    $.ajax({
      type: "POST",
      url: wpcf7.apiSettings.getRoute(
        "/contact-forms/" + wpcf7.getId($form) + "/feedback"
      ),
      data: formData,
      dataType: "json",
      processData: false,
      contentType: false
    })
      .done(function(data, status, xhr) {
        ajaxSuccess(data, status, xhr, $form);
        $(".ajax-loader", $form).removeClass("is-active");
      })
      .fail(function(xhr, status, error) {
        var $e = $('<div class="ajax-error"></div>').text(error.message);
        $form.after($e);
      });
  };
  wpcf7.triggerEvent = function(target, name, detail) {
    var $target = $(target);
    var event = new CustomEvent("wpcf7" + name, {
      bubbles: true,
      detail: detail
    });
    $target.get(0).dispatchEvent(event);
    $target.trigger("wpcf7:" + name, detail);
    $target.trigger(name + ".wpcf7", detail);
  };
  wpcf7.toggleSubmit = function(form, state) {
    var $form = $(form);
    var $submit = $("input:submit", $form);
    if (typeof state !== "undefined") {
      $submit.prop("disabled", !state);
      return;
    }
    if ($form.hasClass("wpcf7-acceptance-as-validation")) {
      return;
    }
    $submit.prop("disabled", false);
    $(".wpcf7-acceptance", $form).each(function() {
      var $span = $(this);
      var $input = $("input:checkbox", $span);
      if (!$span.hasClass("optional")) {
        if (
          ($span.hasClass("invert") && $input.is(":checked")) ||
          (!$span.hasClass("invert") && !$input.is(":checked"))
        ) {
          $submit.prop("disabled", true);
          return false;
        }
      }
    });
  };
  wpcf7.notValidTip = function(target, message) {
    var $target = $(target);
    $(".wpcf7-not-valid-tip", $target).remove();
    $('<span role="alert" class="wpcf7-not-valid-tip"></span>')
      .text(message)
      .appendTo($target);
    if ($target.is(".use-floating-validation-tip *")) {
      var fadeOut = function(target) {
        $(target)
          .not(":hidden")
          .animate(
            {
              opacity: 0
            },
            "fast",
            function() {
              $(this).css({ "z-index": -100 });
            }
          );
      };
      $target.on("mouseover", ".wpcf7-not-valid-tip", function() {
        fadeOut(this);
      });
      $target.on("focus", ":input", function() {
        fadeOut($(".wpcf7-not-valid-tip", $target));
      });
    }
  };
  wpcf7.refill = function(form, data) {
    var $form = $(form);
    var refillCaptcha = function($form, items) {
      $.each(items, function(i, n) {
        $form.find(':input[name="' + i + '"]').val("");
        $form.find("img.wpcf7-captcha-" + i).attr("src", n);
        var match = /([0-9]+)\.(png|gif|jpeg)$/.exec(n);
        $form
          .find('input:hidden[name="_wpcf7_captcha_challenge_' + i + '"]')
          .attr("value", match[1]);
      });
    };
    var refillQuiz = function($form, items) {
      $.each(items, function(i, n) {
        $form.find(':input[name="' + i + '"]').val("");
        $form
          .find(':input[name="' + i + '"]')
          .siblings("span.wpcf7-quiz-label")
          .text(n[0]);
        $form
          .find('input:hidden[name="_wpcf7_quiz_answer_' + i + '"]')
          .attr("value", n[1]);
      });
    };
    if (typeof data === "undefined") {
      $.ajax({
        type: "GET",
        url: wpcf7.apiSettings.getRoute(
          "/contact-forms/" + wpcf7.getId($form) + "/refill"
        ),
        beforeSend: function(xhr) {
          var nonce = $form.find(':input[name="_wpnonce"]').val();
          if (nonce) {
            xhr.setRequestHeader("X-WP-Nonce", nonce);
          }
        },
        dataType: "json"
      }).done(function(data, status, xhr) {
        if (data.captcha) {
          refillCaptcha($form, data.captcha);
        }
        if (data.quiz) {
          refillQuiz($form, data.quiz);
        }
      });
    } else {
      if (data.captcha) {
        refillCaptcha($form, data.captcha);
      }
      if (data.quiz) {
        refillQuiz($form, data.quiz);
      }
    }
  };
  wpcf7.clearResponse = function(form) {
    var $form = $(form);
    $form.removeClass("invalid spam sent failed");
    $form
      .siblings(".screen-reader-response")
      .html("")
      .attr("role", "");
    $(".wpcf7-not-valid-tip", $form).remove();
    $("[aria-invalid]", $form).attr("aria-invalid", "false");
    $(".wpcf7-form-control", $form).removeClass("wpcf7-not-valid");
    $(".wpcf7-response-output", $form)
      .hide()
      .empty()
      .removeAttr("role")
      .removeClass(
        "wpcf7-mail-sent-ok wpcf7-mail-sent-ng wpcf7-validation-errors wpcf7-spam-blocked"
      );
  };
  wpcf7.apiSettings.getRoute = function(path) {
    var url = wpcf7.apiSettings.root;
    url = url.replace(
      wpcf7.apiSettings.namespace,
      wpcf7.apiSettings.namespace + path
    );
    return url;
  };
})(jQuery);
(function() {
  if (typeof window.CustomEvent === "function") return false;
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    );
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();
!(function(e) {
  var n = !1;
  if (
    ("function" == typeof define && define.amd && (define(e), (n = !0)),
    "object" == typeof exports && ((module.exports = e()), (n = !0)),
    !n)
  ) {
    var o = window.Cookies,
      t = (window.Cookies = e());
    t.noConflict = function() {
      return (window.Cookies = o), t;
    };
  }
})(function() {
  function e() {
    for (var e = 0, n = {}; e < arguments.length; e++) {
      var o = arguments[e];
      for (var t in o) n[t] = o[t];
    }
    return n;
  }
  function n(o) {
    function t(n, r, i) {
      var c;
      if ("undefined" != typeof document) {
        if (arguments.length > 1) {
          if (
            "number" == typeof (i = e({ path: "/" }, t.defaults, i)).expires
          ) {
            var a = new Date();
            a.setMilliseconds(a.getMilliseconds() + 864e5 * i.expires),
              (i.expires = a);
          }
          i.expires = i.expires ? i.expires.toUTCString() : "";
          try {
            (c = JSON.stringify(r)), /^[\{\[]/.test(c) && (r = c);
          } catch (m) {}
          (r = o.write
            ? o.write(r, n)
            : encodeURIComponent(String(r)).replace(
                /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
                decodeURIComponent
              )),
            (n = (n = (n = encodeURIComponent(String(n))).replace(
              /%(23|24|26|2B|5E|60|7C)/g,
              decodeURIComponent
            )).replace(/[\(\)]/g, escape));
          var f = "";
          for (var s in i)
            i[s] && ((f += "; " + s), !0 !== i[s] && (f += "=" + i[s]));
          return (document.cookie = n + "=" + r + f);
        }
        n || (c = {});
        for (
          var p = document.cookie ? document.cookie.split("; ") : [],
            d = /(%[0-9A-Z]{2})+/g,
            u = 0;
          u < p.length;
          u++
        ) {
          var l = p[u].split("="),
            C = l.slice(1).join("=");
          '"' === C.charAt(0) && (C = C.slice(1, -1));
          try {
            var g = l[0].replace(d, decodeURIComponent);
            if (
              ((C = o.read
                ? o.read(C, g)
                : o(C, g) || C.replace(d, decodeURIComponent)),
              this.json)
            )
              try {
                C = JSON.parse(C);
              } catch (m) {}
            if (n === g) {
              c = C;
              break;
            }
            n || (c[g] = C);
          } catch (m) {}
        }
        return c;
      }
    }
    return (
      (t.set = t),
      (t.get = function(e) {
        return t.call(t, e);
      }),
      (t.getJSON = function() {
        return t.apply({ json: !0 }, [].slice.call(arguments));
      }),
      (t.defaults = {}),
      (t.remove = function(n, o) {
        t(n, "", e(o, { expires: -1 }));
      }),
      (t.withConverter = n),
      t
    );
  }
  return n(function() {});
});
jQuery(function(i) {
  i(".woocommerce-ordering").on("change", "select.orderby", function() {
    i(this)
      .closest("form")
      .submit();
  }),
    i("input.qty:not(.product-quantity input.qty)").each(function() {
      var o = parseFloat(i(this).attr("min"));
      0 <= o && parseFloat(i(this).val()) < o && i(this).val(o);
    }),
    i(".woocommerce-store-notice__dismiss-link").click(function() {
      Cookies.set("store_notice", "hidden", { path: "/" }),
        i(".woocommerce-store-notice").hide();
    }),
    "hidden" === Cookies.get("store_notice")
      ? i(".woocommerce-store-notice").hide()
      : i(".woocommerce-store-notice").show(),
    i(document.body).on("click", function() {
      i(".woocommerce-input-wrapper span.description:visible")
        .prop("aria-hidden", !0)
        .slideUp(250);
    }),
    i(".woocommerce-input-wrapper").on("click", function(o) {
      o.stopPropagation();
    }),
    i(".woocommerce-input-wrapper :input")
      .on("keydown", function(o) {
        var e = i(this)
          .parent()
          .find("span.description");
        if (27 === o.which && e.length && e.is(":visible"))
          return e.prop("aria-hidden", !0).slideUp(250), o.preventDefault(), !1;
      })
      .on("click focus", function() {
        var o = i(this).parent(),
          e = o.find("span.description");
        o.addClass("currentTarget"),
          i(
            ".woocommerce-input-wrapper:not(.currentTarget) span.description:visible"
          )
            .prop("aria-hidden", !0)
            .slideUp(250),
          e.length &&
            e.is(":hidden") &&
            e.prop("aria-hidden", !1).slideDown(250),
          o.removeClass("currentTarget");
      }),
    (i.scroll_to_notices = function(o) {
      o.length &&
        i("html, body").animate({ scrollTop: o.offset().top - 100 }, 1e3);
    });
});
jQuery(function(n) {
  if ("undefined" == typeof wc_cart_fragments_params) return !1;
  var t = !0,
    o = wc_cart_fragments_params.cart_hash_key;
  try {
    (t = "sessionStorage" in window && null !== window.sessionStorage),
      window.sessionStorage.setItem("wc", "test"),
      window.sessionStorage.removeItem("wc"),
      window.localStorage.setItem("wc", "test"),
      window.localStorage.removeItem("wc");
  } catch (w) {
    t = !1;
  }
  function a() {
    t && sessionStorage.setItem("wc_cart_created", new Date().getTime());
  }
  function s(e) {
    t && (localStorage.setItem(o, e), sessionStorage.setItem(o, e));
  }
  var e = {
    url: wc_cart_fragments_params.wc_ajax_url
      .toString()
      .replace("%%endpoint%%", "get_refreshed_fragments"),
    type: "POST",
    success: function(e) {
      e &&
        e.fragments &&
        (n.each(e.fragments, function(e, t) {
          n(e).replaceWith(t);
        }),
        t &&
          (sessionStorage.setItem(
            wc_cart_fragments_params.fragment_name,
            JSON.stringify(e.fragments)
          ),
          s(e.cart_hash),
          e.cart_hash && a()),
        n(document.body).trigger("wc_fragments_refreshed"));
    }
  };
  function r() {
    n.ajax(e);
  }
  if (t) {
    var i = null;
    n(document.body).on("wc_fragment_refresh updated_wc_div", function() {
      r();
    }),
      n(document.body).on("added_to_cart removed_from_cart", function(e, t, n) {
        var r = sessionStorage.getItem(o);
        (null !== r && r !== undefined && "" !== r) || a(),
          sessionStorage.setItem(
            wc_cart_fragments_params.fragment_name,
            JSON.stringify(t)
          ),
          s(n);
      }),
      n(document.body).on("wc_fragments_refreshed", function() {
        clearTimeout(i), (i = setTimeout(r, 864e5));
      }),
      n(window).on("storage onstorage", function(e) {
        o === e.originalEvent.key &&
          localStorage.getItem(o) !== sessionStorage.getItem(o) &&
          r();
      }),
      n(window).on("pageshow", function(e) {
        e.originalEvent.persisted &&
          (n(".widget_shopping_cart_content").empty(),
          n(document.body).trigger("wc_fragment_refresh"));
      });
    try {
      var c = n.parseJSON(
          sessionStorage.getItem(wc_cart_fragments_params.fragment_name)
        ),
        _ = sessionStorage.getItem(o),
        g = Cookies.get("woocommerce_cart_hash"),
        m = sessionStorage.getItem("wc_cart_created");
      if (
        ((null !== _ && _ !== undefined && "" !== _) || (_ = ""),
        (null !== g && g !== undefined && "" !== g) || (g = ""),
        _ && (null === m || m === undefined || "" === m))
      )
        throw "No cart_created";
      if (m) {
        var d = 1 * m + 864e5,
          f = new Date().getTime();
        if (d < f) throw "Fragment expired";
        i = setTimeout(r, d - f);
      }
      if (!c || !c["div.widget_shopping_cart_content"] || _ !== g)
        throw "No fragment";
      n.each(c, function(e, t) {
        n(e).replaceWith(t);
      }),
        n(document.body).trigger("wc_fragments_loaded");
    } catch (w) {
      r();
    }
  } else r();
  0 < Cookies.get("woocommerce_items_in_cart")
    ? n(".hide_cart_widget_if_empty")
        .closest(".widget_shopping_cart")
        .show()
    : n(".hide_cart_widget_if_empty")
        .closest(".widget_shopping_cart")
        .hide(),
    n(document.body).on("adding_to_cart", function() {
      n(".hide_cart_widget_if_empty")
        .closest(".widget_shopping_cart")
        .show();
    });
});
if ("undefined" == typeof jQuery)
  throw new Error("Bootstrap's JavaScript requires jQuery");
+(function(a) {
  "use strict";
  var b = a.fn.jquery.split(" ")[0].split(".");
  if (
    (b[0] < 2 && b[1] < 9) ||
    (1 == b[0] && 9 == b[1] && b[2] < 1) ||
    b[0] > 3
  )
    throw new Error(
      "Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4"
    );
})(jQuery),
  +(function(a) {
    "use strict";
    function b() {
      var a = document.createElement("bootstrap"),
        b = {
          WebkitTransition: "webkitTransitionEnd",
          MozTransition: "transitionend",
          OTransition: "oTransitionEnd otransitionend",
          transition: "transitionend"
        };
      for (var c in b) if (void 0 !== a.style[c]) return { end: b[c] };
      return !1;
    }
    (a.fn.emulateTransitionEnd = function(b) {
      var c = !1,
        d = this;
      a(this).one("bsTransitionEnd", function() {
        c = !0;
      });
      var e = function() {
        c || a(d).trigger(a.support.transition.end);
      };
      return setTimeout(e, b), this;
    }),
      a(function() {
        (a.support.transition = b()),
          a.support.transition &&
            (a.event.special.bsTransitionEnd = {
              bindType: a.support.transition.end,
              delegateType: a.support.transition.end,
              handle: function(b) {
                if (a(b.target).is(this))
                  return b.handleObj.handler.apply(this, arguments);
              }
            });
      });
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b) {
      return this.each(function() {
        var c = a(this),
          e = c.data("bs.alert");
        e || c.data("bs.alert", (e = new d(this))),
          "string" == typeof b && e[b].call(c);
      });
    }
    var c = '[data-dismiss="alert"]',
      d = function(b) {
        a(b).on("click", c, this.close);
      };
    (d.VERSION = "3.3.7"),
      (d.TRANSITION_DURATION = 150),
      (d.prototype.close = function(b) {
        function c() {
          g.detach()
            .trigger("closed.bs.alert")
            .remove();
        }
        var e = a(this),
          f = e.attr("data-target");
        f || ((f = e.attr("href")), (f = f && f.replace(/.*(?=#[^\s]*$)/, "")));
        var g = a("#" === f ? [] : f);
        b && b.preventDefault(),
          g.length || (g = e.closest(".alert")),
          g.trigger((b = a.Event("close.bs.alert"))),
          b.isDefaultPrevented() ||
            (g.removeClass("in"),
            a.support.transition && g.hasClass("fade")
              ? g
                  .one("bsTransitionEnd", c)
                  .emulateTransitionEnd(d.TRANSITION_DURATION)
              : c());
      });
    var e = a.fn.alert;
    (a.fn.alert = b),
      (a.fn.alert.Constructor = d),
      (a.fn.alert.noConflict = function() {
        return (a.fn.alert = e), this;
      }),
      a(document).on("click.bs.alert.data-api", c, d.prototype.close);
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b) {
      return this.each(function() {
        var d = a(this),
          e = d.data("bs.button"),
          f = "object" == typeof b && b;
        e || d.data("bs.button", (e = new c(this, f))),
          "toggle" == b ? e.toggle() : b && e.setState(b);
      });
    }
    var c = function(b, d) {
      (this.$element = a(b)),
        (this.options = a.extend({}, c.DEFAULTS, d)),
        (this.isLoading = !1);
    };
    (c.VERSION = "3.3.7"),
      (c.DEFAULTS = { loadingText: "loading..." }),
      (c.prototype.setState = function(b) {
        var c = "disabled",
          d = this.$element,
          e = d.is("input") ? "val" : "html",
          f = d.data();
        (b += "Text"),
          null == f.resetText && d.data("resetText", d[e]()),
          setTimeout(
            a.proxy(function() {
              d[e](null == f[b] ? this.options[b] : f[b]),
                "loadingText" == b
                  ? ((this.isLoading = !0),
                    d
                      .addClass(c)
                      .attr(c, c)
                      .prop(c, !0))
                  : this.isLoading &&
                    ((this.isLoading = !1),
                    d
                      .removeClass(c)
                      .removeAttr(c)
                      .prop(c, !1));
            }, this),
            0
          );
      }),
      (c.prototype.toggle = function() {
        var a = !0,
          b = this.$element.closest('[data-toggle="buttons"]');
        if (b.length) {
          var c = this.$element.find("input");
          "radio" == c.prop("type")
            ? (c.prop("checked") && (a = !1),
              b.find(".active").removeClass("active"),
              this.$element.addClass("active"))
            : "checkbox" == c.prop("type") &&
              (c.prop("checked") !== this.$element.hasClass("active") &&
                (a = !1),
              this.$element.toggleClass("active")),
            c.prop("checked", this.$element.hasClass("active")),
            a && c.trigger("change");
        } else
          this.$element.attr("aria-pressed", !this.$element.hasClass("active")),
            this.$element.toggleClass("active");
      });
    var d = a.fn.button;
    (a.fn.button = b),
      (a.fn.button.Constructor = c),
      (a.fn.button.noConflict = function() {
        return (a.fn.button = d), this;
      }),
      a(document)
        .on("click.bs.button.data-api", '[data-toggle^="button"]', function(c) {
          var d = a(c.target).closest(".btn");
          b.call(d, "toggle"),
            a(c.target).is('input[type="radio"], input[type="checkbox"]') ||
              (c.preventDefault(),
              d.is("input,button")
                ? d.trigger("focus")
                : d
                    .find("input:visible,button:visible")
                    .first()
                    .trigger("focus"));
        })
        .on(
          "focus.bs.button.data-api blur.bs.button.data-api",
          '[data-toggle^="button"]',
          function(b) {
            a(b.target)
              .closest(".btn")
              .toggleClass("focus", /^focus(in)?$/.test(b.type));
          }
        );
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b) {
      return this.each(function() {
        var d = a(this),
          e = d.data("bs.carousel"),
          f = a.extend({}, c.DEFAULTS, d.data(), "object" == typeof b && b),
          g = "string" == typeof b ? b : f.slide;
        e || d.data("bs.carousel", (e = new c(this, f))),
          "number" == typeof b
            ? e.to(b)
            : g
            ? e[g]()
            : f.interval && e.pause().cycle();
      });
    }
    var c = function(b, c) {
      (this.$element = a(b)),
        (this.$indicators = this.$element.find(".carousel-indicators")),
        (this.options = c),
        (this.paused = null),
        (this.sliding = null),
        (this.interval = null),
        (this.$active = null),
        (this.$items = null),
        this.options.keyboard &&
          this.$element.on("keydown.bs.carousel", a.proxy(this.keydown, this)),
        "hover" == this.options.pause &&
          !("ontouchstart" in document.documentElement) &&
          this.$element
            .on("mouseenter.bs.carousel", a.proxy(this.pause, this))
            .on("mouseleave.bs.carousel", a.proxy(this.cycle, this));
    };
    (c.VERSION = "3.3.7"),
      (c.TRANSITION_DURATION = 600),
      (c.DEFAULTS = { interval: 5e3, pause: "hover", wrap: !0, keyboard: !0 }),
      (c.prototype.keydown = function(a) {
        if (!/input|textarea/i.test(a.target.tagName)) {
          switch (a.which) {
            case 37:
              this.prev();
              break;
            case 39:
              this.next();
              break;
            default:
              return;
          }
          a.preventDefault();
        }
      }),
      (c.prototype.cycle = function(b) {
        return (
          b || (this.paused = !1),
          this.interval && clearInterval(this.interval),
          this.options.interval &&
            !this.paused &&
            (this.interval = setInterval(
              a.proxy(this.next, this),
              this.options.interval
            )),
          this
        );
      }),
      (c.prototype.getItemIndex = function(a) {
        return (
          (this.$items = a.parent().children(".item")),
          this.$items.index(a || this.$active)
        );
      }),
      (c.prototype.getItemForDirection = function(a, b) {
        var c = this.getItemIndex(b),
          d =
            ("prev" == a && 0 === c) ||
            ("next" == a && c == this.$items.length - 1);
        if (d && !this.options.wrap) return b;
        var e = "prev" == a ? -1 : 1,
          f = (c + e) % this.$items.length;
        return this.$items.eq(f);
      }),
      (c.prototype.to = function(a) {
        var b = this,
          c = this.getItemIndex(
            (this.$active = this.$element.find(".item.active"))
          );
        if (!(a > this.$items.length - 1 || a < 0))
          return this.sliding
            ? this.$element.one("slid.bs.carousel", function() {
                b.to(a);
              })
            : c == a
            ? this.pause().cycle()
            : this.slide(a > c ? "next" : "prev", this.$items.eq(a));
      }),
      (c.prototype.pause = function(b) {
        return (
          b || (this.paused = !0),
          this.$element.find(".next, .prev").length &&
            a.support.transition &&
            (this.$element.trigger(a.support.transition.end), this.cycle(!0)),
          (this.interval = clearInterval(this.interval)),
          this
        );
      }),
      (c.prototype.next = function() {
        if (!this.sliding) return this.slide("next");
      }),
      (c.prototype.prev = function() {
        if (!this.sliding) return this.slide("prev");
      }),
      (c.prototype.slide = function(b, d) {
        var e = this.$element.find(".item.active"),
          f = d || this.getItemForDirection(b, e),
          g = this.interval,
          h = "next" == b ? "left" : "right",
          i = this;
        if (f.hasClass("active")) return (this.sliding = !1);
        var j = f[0],
          k = a.Event("slide.bs.carousel", { relatedTarget: j, direction: h });
        if ((this.$element.trigger(k), !k.isDefaultPrevented())) {
          if (
            ((this.sliding = !0), g && this.pause(), this.$indicators.length)
          ) {
            this.$indicators.find(".active").removeClass("active");
            var l = a(this.$indicators.children()[this.getItemIndex(f)]);
            l && l.addClass("active");
          }
          var m = a.Event("slid.bs.carousel", {
            relatedTarget: j,
            direction: h
          });
          return (
            a.support.transition && this.$element.hasClass("slide")
              ? (f.addClass(b),
                f[0].offsetWidth,
                e.addClass(h),
                f.addClass(h),
                e
                  .one("bsTransitionEnd", function() {
                    f.removeClass([b, h].join(" ")).addClass("active"),
                      e.removeClass(["active", h].join(" ")),
                      (i.sliding = !1),
                      setTimeout(function() {
                        i.$element.trigger(m);
                      }, 0);
                  })
                  .emulateTransitionEnd(c.TRANSITION_DURATION))
              : (e.removeClass("active"),
                f.addClass("active"),
                (this.sliding = !1),
                this.$element.trigger(m)),
            g && this.cycle(),
            this
          );
        }
      });
    var d = a.fn.carousel;
    (a.fn.carousel = b),
      (a.fn.carousel.Constructor = c),
      (a.fn.carousel.noConflict = function() {
        return (a.fn.carousel = d), this;
      });
    var e = function(c) {
      var d,
        e = a(this),
        f = a(
          e.attr("data-target") ||
            ((d = e.attr("href")) && d.replace(/.*(?=#[^\s]+$)/, ""))
        );
      if (f.hasClass("carousel")) {
        var g = a.extend({}, f.data(), e.data()),
          h = e.attr("data-slide-to");
        h && (g.interval = !1),
          b.call(f, g),
          h && f.data("bs.carousel").to(h),
          c.preventDefault();
      }
    };
    a(document)
      .on("click.bs.carousel.data-api", "[data-slide]", e)
      .on("click.bs.carousel.data-api", "[data-slide-to]", e),
      a(window).on("load", function() {
        a('[data-ride="carousel"]').each(function() {
          var c = a(this);
          b.call(c, c.data());
        });
      });
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b) {
      var c,
        d =
          b.attr("data-target") ||
          ((c = b.attr("href")) && c.replace(/.*(?=#[^\s]+$)/, ""));
      return a(d);
    }
    function c(b) {
      return this.each(function() {
        var c = a(this),
          e = c.data("bs.collapse"),
          f = a.extend({}, d.DEFAULTS, c.data(), "object" == typeof b && b);
        !e && f.toggle && /show|hide/.test(b) && (f.toggle = !1),
          e || c.data("bs.collapse", (e = new d(this, f))),
          "string" == typeof b && e[b]();
      });
    }
    var d = function(b, c) {
      (this.$element = a(b)),
        (this.options = a.extend({}, d.DEFAULTS, c)),
        (this.$trigger = a(
          '[data-toggle="collapse"][href="#' +
            b.id +
            '"],[data-toggle="collapse"][data-target="#' +
            b.id +
            '"]'
        )),
        (this.transitioning = null),
        this.options.parent
          ? (this.$parent = this.getParent())
          : this.addAriaAndCollapsedClass(this.$element, this.$trigger),
        this.options.toggle && this.toggle();
    };
    (d.VERSION = "3.3.7"),
      (d.TRANSITION_DURATION = 350),
      (d.DEFAULTS = { toggle: !0 }),
      (d.prototype.dimension = function() {
        var a = this.$element.hasClass("width");
        return a ? "width" : "height";
      }),
      (d.prototype.show = function() {
        if (!this.transitioning && !this.$element.hasClass("in")) {
          var b,
            e =
              this.$parent &&
              this.$parent.children(".panel").children(".in, .collapsing");
          if (
            !(
              e &&
              e.length &&
              ((b = e.data("bs.collapse")), b && b.transitioning)
            )
          ) {
            var f = a.Event("show.bs.collapse");
            if ((this.$element.trigger(f), !f.isDefaultPrevented())) {
              e &&
                e.length &&
                (c.call(e, "hide"), b || e.data("bs.collapse", null));
              var g = this.dimension();
              this.$element
                .removeClass("collapse")
                .addClass("collapsing")
                [g](0)
                .attr("aria-expanded", !0),
                this.$trigger
                  .removeClass("collapsed")
                  .attr("aria-expanded", !0),
                (this.transitioning = 1);
              var h = function() {
                this.$element
                  .removeClass("collapsing")
                  .addClass("collapse in")
                  [g](""),
                  (this.transitioning = 0),
                  this.$element.trigger("shown.bs.collapse");
              };
              if (!a.support.transition) return h.call(this);
              var i = a.camelCase(["scroll", g].join("-"));
              this.$element
                .one("bsTransitionEnd", a.proxy(h, this))
                .emulateTransitionEnd(d.TRANSITION_DURATION)
                [g](this.$element[0][i]);
            }
          }
        }
      }),
      (d.prototype.hide = function() {
        if (!this.transitioning && this.$element.hasClass("in")) {
          var b = a.Event("hide.bs.collapse");
          if ((this.$element.trigger(b), !b.isDefaultPrevented())) {
            var c = this.dimension();
            this.$element[c](this.$element[c]())[0].offsetHeight,
              this.$element
                .addClass("collapsing")
                .removeClass("collapse in")
                .attr("aria-expanded", !1),
              this.$trigger.addClass("collapsed").attr("aria-expanded", !1),
              (this.transitioning = 1);
            var e = function() {
              (this.transitioning = 0),
                this.$element
                  .removeClass("collapsing")
                  .addClass("collapse")
                  .trigger("hidden.bs.collapse");
            };
            return a.support.transition
              ? void this.$element[c](0)
                  .one("bsTransitionEnd", a.proxy(e, this))
                  .emulateTransitionEnd(d.TRANSITION_DURATION)
              : e.call(this);
          }
        }
      }),
      (d.prototype.toggle = function() {
        this[this.$element.hasClass("in") ? "hide" : "show"]();
      }),
      (d.prototype.getParent = function() {
        return a(this.options.parent)
          .find(
            '[data-toggle="collapse"][data-parent="' +
              this.options.parent +
              '"]'
          )
          .each(
            a.proxy(function(c, d) {
              var e = a(d);
              this.addAriaAndCollapsedClass(b(e), e);
            }, this)
          )
          .end();
      }),
      (d.prototype.addAriaAndCollapsedClass = function(a, b) {
        var c = a.hasClass("in");
        a.attr("aria-expanded", c),
          b.toggleClass("collapsed", !c).attr("aria-expanded", c);
      });
    var e = a.fn.collapse;
    (a.fn.collapse = c),
      (a.fn.collapse.Constructor = d),
      (a.fn.collapse.noConflict = function() {
        return (a.fn.collapse = e), this;
      }),
      a(document).on(
        "click.bs.collapse.data-api",
        '[data-toggle="collapse"]',
        function(d) {
          var e = a(this);
          e.attr("data-target") || d.preventDefault();
          var f = b(e),
            g = f.data("bs.collapse"),
            h = g ? "toggle" : e.data();
          c.call(f, h);
        }
      );
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b) {
      var c = b.attr("data-target");
      c ||
        ((c = b.attr("href")),
        (c = c && /#[A-Za-z]/.test(c) && c.replace(/.*(?=#[^\s]*$)/, "")));
      var d = c && a(c);
      return d && d.length ? d : b.parent();
    }
    function c(c) {
      (c && 3 === c.which) ||
        (a(e).remove(),
        a(f).each(function() {
          var d = a(this),
            e = b(d),
            f = { relatedTarget: this };
          e.hasClass("open") &&
            ((c &&
              "click" == c.type &&
              /input|textarea/i.test(c.target.tagName) &&
              a.contains(e[0], c.target)) ||
              (e.trigger((c = a.Event("hide.bs.dropdown", f))),
              c.isDefaultPrevented() ||
                (d.attr("aria-expanded", "false"),
                e
                  .removeClass("open")
                  .trigger(a.Event("hidden.bs.dropdown", f)))));
        }));
    }
    function d(b) {
      return this.each(function() {
        var c = a(this),
          d = c.data("bs.dropdown");
        d || c.data("bs.dropdown", (d = new g(this))),
          "string" == typeof b && d[b].call(c);
      });
    }
    var e = ".dropdown-backdrop",
      f = '[data-toggle="dropdown"]',
      g = function(b) {
        a(b).on("click.bs.dropdown", this.toggle);
      };
    (g.VERSION = "3.3.7"),
      (g.prototype.toggle = function(d) {
        var e = a(this);
        if (!e.is(".disabled, :disabled")) {
          var f = b(e),
            g = f.hasClass("open");
          if ((c(), !g)) {
            "ontouchstart" in document.documentElement &&
              !f.closest(".navbar-nav").length &&
              a(document.createElement("div"))
                .addClass("dropdown-backdrop")
                .insertAfter(a(this))
                .on("click", c);
            var h = { relatedTarget: this };
            if (
              (f.trigger((d = a.Event("show.bs.dropdown", h))),
              d.isDefaultPrevented())
            )
              return;
            e.trigger("focus").attr("aria-expanded", "true"),
              f.toggleClass("open").trigger(a.Event("shown.bs.dropdown", h));
          }
          return !1;
        }
      }),
      (g.prototype.keydown = function(c) {
        if (
          /(38|40|27|32)/.test(c.which) &&
          !/input|textarea/i.test(c.target.tagName)
        ) {
          var d = a(this);
          if (
            (c.preventDefault(),
            c.stopPropagation(),
            !d.is(".disabled, :disabled"))
          ) {
            var e = b(d),
              g = e.hasClass("open");
            if ((!g && 27 != c.which) || (g && 27 == c.which))
              return (
                27 == c.which && e.find(f).trigger("focus"), d.trigger("click")
              );
            var h = " li:not(.disabled):visible a",
              i = e.find(".dropdown-menu" + h);
            if (i.length) {
              var j = i.index(c.target);
              38 == c.which && j > 0 && j--,
                40 == c.which && j < i.length - 1 && j++,
                ~j || (j = 0),
                i.eq(j).trigger("focus");
            }
          }
        }
      });
    var h = a.fn.dropdown;
    (a.fn.dropdown = d),
      (a.fn.dropdown.Constructor = g),
      (a.fn.dropdown.noConflict = function() {
        return (a.fn.dropdown = h), this;
      }),
      a(document)
        .on("click.bs.dropdown.data-api", c)
        .on("click.bs.dropdown.data-api", ".dropdown form", function(a) {
          a.stopPropagation();
        })
        .on("click.bs.dropdown.data-api", f, g.prototype.toggle)
        .on("keydown.bs.dropdown.data-api", f, g.prototype.keydown)
        .on(
          "keydown.bs.dropdown.data-api",
          ".dropdown-menu",
          g.prototype.keydown
        );
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b, d) {
      return this.each(function() {
        var e = a(this),
          f = e.data("bs.modal"),
          g = a.extend({}, c.DEFAULTS, e.data(), "object" == typeof b && b);
        f || e.data("bs.modal", (f = new c(this, g))),
          "string" == typeof b ? f[b](d) : g.show && f.show(d);
      });
    }
    var c = function(b, c) {
      (this.options = c),
        (this.$body = a(document.body)),
        (this.$element = a(b)),
        (this.$dialog = this.$element.find(".modal-dialog")),
        (this.$backdrop = null),
        (this.isShown = null),
        (this.originalBodyPad = null),
        (this.scrollbarWidth = 0),
        (this.ignoreBackdropClick = !1),
        this.options.remote &&
          this.$element.find(".modal-content").load(
            this.options.remote,
            a.proxy(function() {
              this.$element.trigger("loaded.bs.modal");
            }, this)
          );
    };
    (c.VERSION = "3.3.7"),
      (c.TRANSITION_DURATION = 300),
      (c.BACKDROP_TRANSITION_DURATION = 150),
      (c.DEFAULTS = { backdrop: !0, keyboard: !0, show: !0 }),
      (c.prototype.toggle = function(a) {
        return this.isShown ? this.hide() : this.show(a);
      }),
      (c.prototype.show = function(b) {
        var d = this,
          e = a.Event("show.bs.modal", { relatedTarget: b });
        this.$element.trigger(e),
          this.isShown ||
            e.isDefaultPrevented() ||
            ((this.isShown = !0),
            this.checkScrollbar(),
            this.setScrollbar(),
            this.$body.addClass("modal-open"),
            this.escape(),
            this.resize(),
            this.$element.on(
              "click.dismiss.bs.modal",
              '[data-dismiss="modal"]',
              a.proxy(this.hide, this)
            ),
            this.$dialog.on("mousedown.dismiss.bs.modal", function() {
              d.$element.one("mouseup.dismiss.bs.modal", function(b) {
                a(b.target).is(d.$element) && (d.ignoreBackdropClick = !0);
              });
            }),
            this.backdrop(function() {
              var e = a.support.transition && d.$element.hasClass("fade");
              d.$element.parent().length || d.$element.appendTo(d.$body),
                d.$element.show().scrollTop(0),
                d.adjustDialog(),
                e && d.$element[0].offsetWidth,
                d.$element.addClass("in"),
                d.enforceFocus();
              var f = a.Event("shown.bs.modal", { relatedTarget: b });
              e
                ? d.$dialog
                    .one("bsTransitionEnd", function() {
                      d.$element.trigger("focus").trigger(f);
                    })
                    .emulateTransitionEnd(c.TRANSITION_DURATION)
                : d.$element.trigger("focus").trigger(f);
            }));
      }),
      (c.prototype.hide = function(b) {
        b && b.preventDefault(),
          (b = a.Event("hide.bs.modal")),
          this.$element.trigger(b),
          this.isShown &&
            !b.isDefaultPrevented() &&
            ((this.isShown = !1),
            this.escape(),
            this.resize(),
            a(document).off("focusin.bs.modal"),
            this.$element
              .removeClass("in")
              .off("click.dismiss.bs.modal")
              .off("mouseup.dismiss.bs.modal"),
            this.$dialog.off("mousedown.dismiss.bs.modal"),
            a.support.transition && this.$element.hasClass("fade")
              ? this.$element
                  .one("bsTransitionEnd", a.proxy(this.hideModal, this))
                  .emulateTransitionEnd(c.TRANSITION_DURATION)
              : this.hideModal());
      }),
      (c.prototype.enforceFocus = function() {
        a(document)
          .off("focusin.bs.modal")
          .on(
            "focusin.bs.modal",
            a.proxy(function(a) {
              document === a.target ||
                this.$element[0] === a.target ||
                this.$element.has(a.target).length ||
                this.$element.trigger("focus");
            }, this)
          );
      }),
      (c.prototype.escape = function() {
        this.isShown && this.options.keyboard
          ? this.$element.on(
              "keydown.dismiss.bs.modal",
              a.proxy(function(a) {
                27 == a.which && this.hide();
              }, this)
            )
          : this.isShown || this.$element.off("keydown.dismiss.bs.modal");
      }),
      (c.prototype.resize = function() {
        this.isShown
          ? a(window).on("resize.bs.modal", a.proxy(this.handleUpdate, this))
          : a(window).off("resize.bs.modal");
      }),
      (c.prototype.hideModal = function() {
        var a = this;
        this.$element.hide(),
          this.backdrop(function() {
            a.$body.removeClass("modal-open"),
              a.resetAdjustments(),
              a.resetScrollbar(),
              a.$element.trigger("hidden.bs.modal");
          });
      }),
      (c.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove(), (this.$backdrop = null);
      }),
      (c.prototype.backdrop = function(b) {
        var d = this,
          e = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
          var f = a.support.transition && e;
          if (
            ((this.$backdrop = a(document.createElement("div"))
              .addClass("modal-backdrop " + e)
              .appendTo(this.$body)),
            this.$element.on(
              "click.dismiss.bs.modal",
              a.proxy(function(a) {
                return this.ignoreBackdropClick
                  ? void (this.ignoreBackdropClick = !1)
                  : void (
                      a.target === a.currentTarget &&
                      ("static" == this.options.backdrop
                        ? this.$element[0].focus()
                        : this.hide())
                    );
              }, this)
            ),
            f && this.$backdrop[0].offsetWidth,
            this.$backdrop.addClass("in"),
            !b)
          )
            return;
          f
            ? this.$backdrop
                .one("bsTransitionEnd", b)
                .emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION)
            : b();
        } else if (!this.isShown && this.$backdrop) {
          this.$backdrop.removeClass("in");
          var g = function() {
            d.removeBackdrop(), b && b();
          };
          a.support.transition && this.$element.hasClass("fade")
            ? this.$backdrop
                .one("bsTransitionEnd", g)
                .emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION)
            : g();
        } else b && b();
      }),
      (c.prototype.handleUpdate = function() {
        this.adjustDialog();
      }),
      (c.prototype.adjustDialog = function() {
        var a =
          this.$element[0].scrollHeight > document.documentElement.clientHeight;
        this.$element.css({
          paddingLeft: !this.bodyIsOverflowing && a ? this.scrollbarWidth : "",
          paddingRight: this.bodyIsOverflowing && !a ? this.scrollbarWidth : ""
        });
      }),
      (c.prototype.resetAdjustments = function() {
        this.$element.css({ paddingLeft: "", paddingRight: "" });
      }),
      (c.prototype.checkScrollbar = function() {
        var a = window.innerWidth;
        if (!a) {
          var b = document.documentElement.getBoundingClientRect();
          a = b.right - Math.abs(b.left);
        }
        (this.bodyIsOverflowing = document.body.clientWidth < a),
          (this.scrollbarWidth = this.measureScrollbar());
      }),
      (c.prototype.setScrollbar = function() {
        var a = parseInt(this.$body.css("padding-right") || 0, 10);
        (this.originalBodyPad = document.body.style.paddingRight || ""),
          this.bodyIsOverflowing &&
            this.$body.css("padding-right", a + this.scrollbarWidth);
      }),
      (c.prototype.resetScrollbar = function() {
        this.$body.css("padding-right", this.originalBodyPad);
      }),
      (c.prototype.measureScrollbar = function() {
        var a = document.createElement("div");
        (a.className = "modal-scrollbar-measure"), this.$body.append(a);
        var b = a.offsetWidth - a.clientWidth;
        return this.$body[0].removeChild(a), b;
      });
    var d = a.fn.modal;
    (a.fn.modal = b),
      (a.fn.modal.Constructor = c),
      (a.fn.modal.noConflict = function() {
        return (a.fn.modal = d), this;
      }),
      a(document).on(
        "click.bs.modal.data-api",
        '[data-toggle="modal"]',
        function(c) {
          var d = a(this),
            e = d.attr("href"),
            f = a(
              d.attr("data-target") || (e && e.replace(/.*(?=#[^\s]+$)/, ""))
            ),
            g = f.data("bs.modal")
              ? "toggle"
              : a.extend({ remote: !/#/.test(e) && e }, f.data(), d.data());
          d.is("a") && c.preventDefault(),
            f.one("show.bs.modal", function(a) {
              a.isDefaultPrevented() ||
                f.one("hidden.bs.modal", function() {
                  d.is(":visible") && d.trigger("focus");
                });
            }),
            b.call(f, g, this);
        }
      );
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b) {
      return this.each(function() {
        var d = a(this),
          e = d.data("bs.tooltip"),
          f = "object" == typeof b && b;
        (!e && /destroy|hide/.test(b)) ||
          (e || d.data("bs.tooltip", (e = new c(this, f))),
          "string" == typeof b && e[b]());
      });
    }
    var c = function(a, b) {
      (this.type = null),
        (this.options = null),
        (this.enabled = null),
        (this.timeout = null),
        (this.hoverState = null),
        (this.$element = null),
        (this.inState = null),
        this.init("tooltip", a, b);
    };
    (c.VERSION = "3.3.7"),
      (c.TRANSITION_DURATION = 150),
      (c.DEFAULTS = {
        animation: !0,
        placement: "top",
        selector: !1,
        template:
          '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover focus",
        title: "",
        delay: 0,
        html: !1,
        container: !1,
        viewport: { selector: "body", padding: 0 }
      }),
      (c.prototype.init = function(b, c, d) {
        if (
          ((this.enabled = !0),
          (this.type = b),
          (this.$element = a(c)),
          (this.options = this.getOptions(d)),
          (this.$viewport =
            this.options.viewport &&
            a(
              a.isFunction(this.options.viewport)
                ? this.options.viewport.call(this, this.$element)
                : this.options.viewport.selector || this.options.viewport
            )),
          (this.inState = { click: !1, hover: !1, focus: !1 }),
          this.$element[0] instanceof document.constructor &&
            !this.options.selector)
        )
          throw new Error(
            "`selector` option must be specified when initializing " +
              this.type +
              " on the window.document object!"
          );
        for (var e = this.options.trigger.split(" "), f = e.length; f--; ) {
          var g = e[f];
          if ("click" == g)
            this.$element.on(
              "click." + this.type,
              this.options.selector,
              a.proxy(this.toggle, this)
            );
          else if ("manual" != g) {
            var h = "hover" == g ? "mouseenter" : "focusin",
              i = "hover" == g ? "mouseleave" : "focusout";
            this.$element.on(
              h + "." + this.type,
              this.options.selector,
              a.proxy(this.enter, this)
            ),
              this.$element.on(
                i + "." + this.type,
                this.options.selector,
                a.proxy(this.leave, this)
              );
          }
        }
        this.options.selector
          ? (this._options = a.extend({}, this.options, {
              trigger: "manual",
              selector: ""
            }))
          : this.fixTitle();
      }),
      (c.prototype.getDefaults = function() {
        return c.DEFAULTS;
      }),
      (c.prototype.getOptions = function(b) {
        return (
          (b = a.extend({}, this.getDefaults(), this.$element.data(), b)),
          b.delay &&
            "number" == typeof b.delay &&
            (b.delay = { show: b.delay, hide: b.delay }),
          b
        );
      }),
      (c.prototype.getDelegateOptions = function() {
        var b = {},
          c = this.getDefaults();
        return (
          this._options &&
            a.each(this._options, function(a, d) {
              c[a] != d && (b[a] = d);
            }),
          b
        );
      }),
      (c.prototype.enter = function(b) {
        var c =
          b instanceof this.constructor
            ? b
            : a(b.currentTarget).data("bs." + this.type);
        return (
          c ||
            ((c = new this.constructor(
              b.currentTarget,
              this.getDelegateOptions()
            )),
            a(b.currentTarget).data("bs." + this.type, c)),
          b instanceof a.Event &&
            (c.inState["focusin" == b.type ? "focus" : "hover"] = !0),
          c.tip().hasClass("in") || "in" == c.hoverState
            ? void (c.hoverState = "in")
            : (clearTimeout(c.timeout),
              (c.hoverState = "in"),
              c.options.delay && c.options.delay.show
                ? void (c.timeout = setTimeout(function() {
                    "in" == c.hoverState && c.show();
                  }, c.options.delay.show))
                : c.show())
        );
      }),
      (c.prototype.isInStateTrue = function() {
        for (var a in this.inState) if (this.inState[a]) return !0;
        return !1;
      }),
      (c.prototype.leave = function(b) {
        var c =
          b instanceof this.constructor
            ? b
            : a(b.currentTarget).data("bs." + this.type);
        if (
          (c ||
            ((c = new this.constructor(
              b.currentTarget,
              this.getDelegateOptions()
            )),
            a(b.currentTarget).data("bs." + this.type, c)),
          b instanceof a.Event &&
            (c.inState["focusout" == b.type ? "focus" : "hover"] = !1),
          !c.isInStateTrue())
        )
          return (
            clearTimeout(c.timeout),
            (c.hoverState = "out"),
            c.options.delay && c.options.delay.hide
              ? void (c.timeout = setTimeout(function() {
                  "out" == c.hoverState && c.hide();
                }, c.options.delay.hide))
              : c.hide()
          );
      }),
      (c.prototype.show = function() {
        var b = a.Event("show.bs." + this.type);
        if (this.hasContent() && this.enabled) {
          this.$element.trigger(b);
          var d = a.contains(
            this.$element[0].ownerDocument.documentElement,
            this.$element[0]
          );
          if (b.isDefaultPrevented() || !d) return;
          var e = this,
            f = this.tip(),
            g = this.getUID(this.type);
          this.setContent(),
            f.attr("id", g),
            this.$element.attr("aria-describedby", g),
            this.options.animation && f.addClass("fade");
          var h =
              "function" == typeof this.options.placement
                ? this.options.placement.call(this, f[0], this.$element[0])
                : this.options.placement,
            i = /\s?auto?\s?/i,
            j = i.test(h);
          j && (h = h.replace(i, "") || "top"),
            f
              .detach()
              .css({ top: 0, left: 0, display: "block" })
              .addClass(h)
              .data("bs." + this.type, this),
            this.options.container
              ? f.appendTo(this.options.container)
              : f.insertAfter(this.$element),
            this.$element.trigger("inserted.bs." + this.type);
          var k = this.getPosition(),
            l = f[0].offsetWidth,
            m = f[0].offsetHeight;
          if (j) {
            var n = h,
              o = this.getPosition(this.$viewport);
            (h =
              "bottom" == h && k.bottom + m > o.bottom
                ? "top"
                : "top" == h && k.top - m < o.top
                ? "bottom"
                : "right" == h && k.right + l > o.width
                ? "left"
                : "left" == h && k.left - l < o.left
                ? "right"
                : h),
              f.removeClass(n).addClass(h);
          }
          var p = this.getCalculatedOffset(h, k, l, m);
          this.applyPlacement(p, h);
          var q = function() {
            var a = e.hoverState;
            e.$element.trigger("shown.bs." + e.type),
              (e.hoverState = null),
              "out" == a && e.leave(e);
          };
          a.support.transition && this.$tip.hasClass("fade")
            ? f
                .one("bsTransitionEnd", q)
                .emulateTransitionEnd(c.TRANSITION_DURATION)
            : q();
        }
      }),
      (c.prototype.applyPlacement = function(b, c) {
        var d = this.tip(),
          e = d[0].offsetWidth,
          f = d[0].offsetHeight,
          g = parseInt(d.css("margin-top"), 10),
          h = parseInt(d.css("margin-left"), 10);
        isNaN(g) && (g = 0),
          isNaN(h) && (h = 0),
          (b.top += g),
          (b.left += h),
          a.offset.setOffset(
            d[0],
            a.extend(
              {
                using: function(a) {
                  d.css({ top: Math.round(a.top), left: Math.round(a.left) });
                }
              },
              b
            ),
            0
          ),
          d.addClass("in");
        var i = d[0].offsetWidth,
          j = d[0].offsetHeight;
        "top" == c && j != f && (b.top = b.top + f - j);
        var k = this.getViewportAdjustedDelta(c, b, i, j);
        k.left ? (b.left += k.left) : (b.top += k.top);
        var l = /top|bottom/.test(c),
          m = l ? 2 * k.left - e + i : 2 * k.top - f + j,
          n = l ? "offsetWidth" : "offsetHeight";
        d.offset(b), this.replaceArrow(m, d[0][n], l);
      }),
      (c.prototype.replaceArrow = function(a, b, c) {
        this.arrow()
          .css(c ? "left" : "top", 50 * (1 - a / b) + "%")
          .css(c ? "top" : "left", "");
      }),
      (c.prototype.setContent = function() {
        var a = this.tip(),
          b = this.getTitle();
        a.find(".tooltip-inner")[this.options.html ? "html" : "text"](b),
          a.removeClass("fade in top bottom left right");
      }),
      (c.prototype.hide = function(b) {
        function d() {
          "in" != e.hoverState && f.detach(),
            e.$element &&
              e.$element
                .removeAttr("aria-describedby")
                .trigger("hidden.bs." + e.type),
            b && b();
        }
        var e = this,
          f = a(this.$tip),
          g = a.Event("hide.bs." + this.type);
        if ((this.$element.trigger(g), !g.isDefaultPrevented()))
          return (
            f.removeClass("in"),
            a.support.transition && f.hasClass("fade")
              ? f
                  .one("bsTransitionEnd", d)
                  .emulateTransitionEnd(c.TRANSITION_DURATION)
              : d(),
            (this.hoverState = null),
            this
          );
      }),
      (c.prototype.fixTitle = function() {
        var a = this.$element;
        (a.attr("title") || "string" != typeof a.attr("data-original-title")) &&
          a
            .attr("data-original-title", a.attr("title") || "")
            .attr("title", "");
      }),
      (c.prototype.hasContent = function() {
        return this.getTitle();
      }),
      (c.prototype.getPosition = function(b) {
        b = b || this.$element;
        var c = b[0],
          d = "BODY" == c.tagName,
          e = c.getBoundingClientRect();
        null == e.width &&
          (e = a.extend({}, e, {
            width: e.right - e.left,
            height: e.bottom - e.top
          }));
        var f = window.SVGElement && c instanceof window.SVGElement,
          g = d ? { top: 0, left: 0 } : f ? null : b.offset(),
          h = {
            scroll: d
              ? document.documentElement.scrollTop || document.body.scrollTop
              : b.scrollTop()
          },
          i = d
            ? { width: a(window).width(), height: a(window).height() }
            : null;
        return a.extend({}, e, h, i, g);
      }),
      (c.prototype.getCalculatedOffset = function(a, b, c, d) {
        return "bottom" == a
          ? { top: b.top + b.height, left: b.left + b.width / 2 - c / 2 }
          : "top" == a
          ? { top: b.top - d, left: b.left + b.width / 2 - c / 2 }
          : "left" == a
          ? { top: b.top + b.height / 2 - d / 2, left: b.left - c }
          : { top: b.top + b.height / 2 - d / 2, left: b.left + b.width };
      }),
      (c.prototype.getViewportAdjustedDelta = function(a, b, c, d) {
        var e = { top: 0, left: 0 };
        if (!this.$viewport) return e;
        var f = (this.options.viewport && this.options.viewport.padding) || 0,
          g = this.getPosition(this.$viewport);
        if (/right|left/.test(a)) {
          var h = b.top - f - g.scroll,
            i = b.top + f - g.scroll + d;
          h < g.top
            ? (e.top = g.top - h)
            : i > g.top + g.height && (e.top = g.top + g.height - i);
        } else {
          var j = b.left - f,
            k = b.left + f + c;
          j < g.left
            ? (e.left = g.left - j)
            : k > g.right && (e.left = g.left + g.width - k);
        }
        return e;
      }),
      (c.prototype.getTitle = function() {
        var a,
          b = this.$element,
          c = this.options;
        return (a =
          b.attr("data-original-title") ||
          ("function" == typeof c.title ? c.title.call(b[0]) : c.title));
      }),
      (c.prototype.getUID = function(a) {
        do a += ~~(1e6 * Math.random());
        while (document.getElementById(a));
        return a;
      }),
      (c.prototype.tip = function() {
        if (
          !this.$tip &&
          ((this.$tip = a(this.options.template)), 1 != this.$tip.length)
        )
          throw new Error(
            this.type +
              " `template` option must consist of exactly 1 top-level element!"
          );
        return this.$tip;
      }),
      (c.prototype.arrow = function() {
        return (this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow"));
      }),
      (c.prototype.enable = function() {
        this.enabled = !0;
      }),
      (c.prototype.disable = function() {
        this.enabled = !1;
      }),
      (c.prototype.toggleEnabled = function() {
        this.enabled = !this.enabled;
      }),
      (c.prototype.toggle = function(b) {
        var c = this;
        b &&
          ((c = a(b.currentTarget).data("bs." + this.type)),
          c ||
            ((c = new this.constructor(
              b.currentTarget,
              this.getDelegateOptions()
            )),
            a(b.currentTarget).data("bs." + this.type, c))),
          b
            ? ((c.inState.click = !c.inState.click),
              c.isInStateTrue() ? c.enter(c) : c.leave(c))
            : c.tip().hasClass("in")
            ? c.leave(c)
            : c.enter(c);
      }),
      (c.prototype.destroy = function() {
        var a = this;
        clearTimeout(this.timeout),
          this.hide(function() {
            a.$element.off("." + a.type).removeData("bs." + a.type),
              a.$tip && a.$tip.detach(),
              (a.$tip = null),
              (a.$arrow = null),
              (a.$viewport = null),
              (a.$element = null);
          });
      });
    var d = a.fn.tooltip;
    (a.fn.tooltip = b),
      (a.fn.tooltip.Constructor = c),
      (a.fn.tooltip.noConflict = function() {
        return (a.fn.tooltip = d), this;
      });
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b) {
      return this.each(function() {
        var d = a(this),
          e = d.data("bs.popover"),
          f = "object" == typeof b && b;
        (!e && /destroy|hide/.test(b)) ||
          (e || d.data("bs.popover", (e = new c(this, f))),
          "string" == typeof b && e[b]());
      });
    }
    var c = function(a, b) {
      this.init("popover", a, b);
    };
    if (!a.fn.tooltip) throw new Error("Popover requires tooltip.js");
    (c.VERSION = "3.3.7"),
      (c.DEFAULTS = a.extend({}, a.fn.tooltip.Constructor.DEFAULTS, {
        placement: "right",
        trigger: "click",
        content: "",
        template:
          '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
      })),
      (c.prototype = a.extend({}, a.fn.tooltip.Constructor.prototype)),
      (c.prototype.constructor = c),
      (c.prototype.getDefaults = function() {
        return c.DEFAULTS;
      }),
      (c.prototype.setContent = function() {
        var a = this.tip(),
          b = this.getTitle(),
          c = this.getContent();
        a.find(".popover-title")[this.options.html ? "html" : "text"](b),
          a
            .find(".popover-content")
            .children()
            .detach()
            .end()
            [
              this.options.html
                ? "string" == typeof c
                  ? "html"
                  : "append"
                : "text"
            ](c),
          a.removeClass("fade top bottom left right in"),
          a.find(".popover-title").html() || a.find(".popover-title").hide();
      }),
      (c.prototype.hasContent = function() {
        return this.getTitle() || this.getContent();
      }),
      (c.prototype.getContent = function() {
        var a = this.$element,
          b = this.options;
        return (
          a.attr("data-content") ||
          ("function" == typeof b.content ? b.content.call(a[0]) : b.content)
        );
      }),
      (c.prototype.arrow = function() {
        return (this.$arrow = this.$arrow || this.tip().find(".arrow"));
      });
    var d = a.fn.popover;
    (a.fn.popover = b),
      (a.fn.popover.Constructor = c),
      (a.fn.popover.noConflict = function() {
        return (a.fn.popover = d), this;
      });
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(c, d) {
      (this.$body = a(document.body)),
        (this.$scrollElement = a(a(c).is(document.body) ? window : c)),
        (this.options = a.extend({}, b.DEFAULTS, d)),
        (this.selector = (this.options.target || "") + " .nav li > a"),
        (this.offsets = []),
        (this.targets = []),
        (this.activeTarget = null),
        (this.scrollHeight = 0),
        this.$scrollElement.on(
          "scroll.bs.scrollspy",
          a.proxy(this.process, this)
        ),
        this.refresh(),
        this.process();
    }
    function c(c) {
      return this.each(function() {
        var d = a(this),
          e = d.data("bs.scrollspy"),
          f = "object" == typeof c && c;
        e || d.data("bs.scrollspy", (e = new b(this, f))),
          "string" == typeof c && e[c]();
      });
    }
    (b.VERSION = "3.3.7"),
      (b.DEFAULTS = { offset: 10 }),
      (b.prototype.getScrollHeight = function() {
        return (
          this.$scrollElement[0].scrollHeight ||
          Math.max(
            this.$body[0].scrollHeight,
            document.documentElement.scrollHeight
          )
        );
      }),
      (b.prototype.refresh = function() {
        var b = this,
          c = "offset",
          d = 0;
        (this.offsets = []),
          (this.targets = []),
          (this.scrollHeight = this.getScrollHeight()),
          a.isWindow(this.$scrollElement[0]) ||
            ((c = "position"), (d = this.$scrollElement.scrollTop())),
          this.$body
            .find(this.selector)
            .map(function() {
              var b = a(this),
                e = b.data("target") || b.attr("href"),
                f = /^#./.test(e) && a(e);
              return (
                (f && f.length && f.is(":visible") && [[f[c]().top + d, e]]) ||
                null
              );
            })
            .sort(function(a, b) {
              return a[0] - b[0];
            })
            .each(function() {
              b.offsets.push(this[0]), b.targets.push(this[1]);
            });
      }),
      (b.prototype.process = function() {
        var a,
          b = this.$scrollElement.scrollTop() + this.options.offset,
          c = this.getScrollHeight(),
          d = this.options.offset + c - this.$scrollElement.height(),
          e = this.offsets,
          f = this.targets,
          g = this.activeTarget;
        if ((this.scrollHeight != c && this.refresh(), b >= d))
          return g != (a = f[f.length - 1]) && this.activate(a);
        if (g && b < e[0]) return (this.activeTarget = null), this.clear();
        for (a = e.length; a--; )
          g != f[a] &&
            b >= e[a] &&
            (void 0 === e[a + 1] || b < e[a + 1]) &&
            this.activate(f[a]);
      }),
      (b.prototype.activate = function(b) {
        (this.activeTarget = b), this.clear();
        var c =
            this.selector +
            '[data-target="' +
            b +
            '"],' +
            this.selector +
            '[href="' +
            b +
            '"]',
          d = a(c)
            .parents("li")
            .addClass("active");
        d.parent(".dropdown-menu").length &&
          (d = d.closest("li.dropdown").addClass("active")),
          d.trigger("activate.bs.scrollspy");
      }),
      (b.prototype.clear = function() {
        a(this.selector)
          .parentsUntil(this.options.target, ".active")
          .removeClass("active");
      });
    var d = a.fn.scrollspy;
    (a.fn.scrollspy = c),
      (a.fn.scrollspy.Constructor = b),
      (a.fn.scrollspy.noConflict = function() {
        return (a.fn.scrollspy = d), this;
      }),
      a(window).on("load.bs.scrollspy.data-api", function() {
        a('[data-spy="scroll"]').each(function() {
          var b = a(this);
          c.call(b, b.data());
        });
      });
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b) {
      return this.each(function() {
        var d = a(this),
          e = d.data("bs.tab");
        e || d.data("bs.tab", (e = new c(this))),
          "string" == typeof b && e[b]();
      });
    }
    var c = function(b) {
      this.element = a(b);
    };
    (c.VERSION = "3.3.7"),
      (c.TRANSITION_DURATION = 150),
      (c.prototype.show = function() {
        var b = this.element,
          c = b.closest("ul:not(.dropdown-menu)"),
          d = b.data("target");
        if (
          (d ||
            ((d = b.attr("href")), (d = d && d.replace(/.*(?=#[^\s]*$)/, ""))),
          !b.parent("li").hasClass("active"))
        ) {
          var e = c.find(".active:last a"),
            f = a.Event("hide.bs.tab", { relatedTarget: b[0] }),
            g = a.Event("show.bs.tab", { relatedTarget: e[0] });
          if (
            (e.trigger(f),
            b.trigger(g),
            !g.isDefaultPrevented() && !f.isDefaultPrevented())
          ) {
            var h = a(d);
            this.activate(b.closest("li"), c),
              this.activate(h, h.parent(), function() {
                e.trigger({ type: "hidden.bs.tab", relatedTarget: b[0] }),
                  b.trigger({ type: "shown.bs.tab", relatedTarget: e[0] });
              });
          }
        }
      }),
      (c.prototype.activate = function(b, d, e) {
        function f() {
          g
            .removeClass("active")
            .find("> .dropdown-menu > .active")
            .removeClass("active")
            .end()
            .find('[data-toggle="tab"]')
            .attr("aria-expanded", !1),
            b
              .addClass("active")
              .find('[data-toggle="tab"]')
              .attr("aria-expanded", !0),
            h ? (b[0].offsetWidth, b.addClass("in")) : b.removeClass("fade"),
            b.parent(".dropdown-menu").length &&
              b
                .closest("li.dropdown")
                .addClass("active")
                .end()
                .find('[data-toggle="tab"]')
                .attr("aria-expanded", !0),
            e && e();
        }
        var g = d.find("> .active"),
          h =
            e &&
            a.support.transition &&
            ((g.length && g.hasClass("fade")) || !!d.find("> .fade").length);
        g.length && h
          ? g
              .one("bsTransitionEnd", f)
              .emulateTransitionEnd(c.TRANSITION_DURATION)
          : f(),
          g.removeClass("in");
      });
    var d = a.fn.tab;
    (a.fn.tab = b),
      (a.fn.tab.Constructor = c),
      (a.fn.tab.noConflict = function() {
        return (a.fn.tab = d), this;
      });
    var e = function(c) {
      c.preventDefault(), b.call(a(this), "show");
    };
    a(document)
      .on("click.bs.tab.data-api", '[data-toggle="tab"]', e)
      .on("click.bs.tab.data-api", '[data-toggle="pill"]', e);
  })(jQuery),
  +(function(a) {
    "use strict";
    function b(b) {
      return this.each(function() {
        var d = a(this),
          e = d.data("bs.affix"),
          f = "object" == typeof b && b;
        e || d.data("bs.affix", (e = new c(this, f))),
          "string" == typeof b && e[b]();
      });
    }
    var c = function(b, d) {
      (this.options = a.extend({}, c.DEFAULTS, d)),
        (this.$target = a(this.options.target)
          .on("scroll.bs.affix.data-api", a.proxy(this.checkPosition, this))
          .on(
            "click.bs.affix.data-api",
            a.proxy(this.checkPositionWithEventLoop, this)
          )),
        (this.$element = a(b)),
        (this.affixed = null),
        (this.unpin = null),
        (this.pinnedOffset = null),
        this.checkPosition();
    };
    (c.VERSION = "3.3.7"),
      (c.RESET = "affix affix-top affix-bottom"),
      (c.DEFAULTS = { offset: 0, target: window }),
      (c.prototype.getState = function(a, b, c, d) {
        var e = this.$target.scrollTop(),
          f = this.$element.offset(),
          g = this.$target.height();
        if (null != c && "top" == this.affixed) return e < c && "top";
        if ("bottom" == this.affixed)
          return null != c
            ? !(e + this.unpin <= f.top) && "bottom"
            : !(e + g <= a - d) && "bottom";
        var h = null == this.affixed,
          i = h ? e : f.top,
          j = h ? g : b;
        return null != c && e <= c
          ? "top"
          : null != d && i + j >= a - d && "bottom";
      }),
      (c.prototype.getPinnedOffset = function() {
        if (this.pinnedOffset) return this.pinnedOffset;
        this.$element.removeClass(c.RESET).addClass("affix");
        var a = this.$target.scrollTop(),
          b = this.$element.offset();
        return (this.pinnedOffset = b.top - a);
      }),
      (c.prototype.checkPositionWithEventLoop = function() {
        setTimeout(a.proxy(this.checkPosition, this), 1);
      }),
      (c.prototype.checkPosition = function() {
        if (this.$element.is(":visible")) {
          var b = this.$element.height(),
            d = this.options.offset,
            e = d.top,
            f = d.bottom,
            g = Math.max(a(document).height(), a(document.body).height());
          "object" != typeof d && (f = e = d),
            "function" == typeof e && (e = d.top(this.$element)),
            "function" == typeof f && (f = d.bottom(this.$element));
          var h = this.getState(g, b, e, f);
          if (this.affixed != h) {
            null != this.unpin && this.$element.css("top", "");
            var i = "affix" + (h ? "-" + h : ""),
              j = a.Event(i + ".bs.affix");
            if ((this.$element.trigger(j), j.isDefaultPrevented())) return;
            (this.affixed = h),
              (this.unpin = "bottom" == h ? this.getPinnedOffset() : null),
              this.$element
                .removeClass(c.RESET)
                .addClass(i)
                .trigger(i.replace("affix", "affixed") + ".bs.affix");
          }
          "bottom" == h && this.$element.offset({ top: g - b - f });
        }
      });
    var d = a.fn.affix;
    (a.fn.affix = b),
      (a.fn.affix.Constructor = c),
      (a.fn.affix.noConflict = function() {
        return (a.fn.affix = d), this;
      }),
      a(window).on("load", function() {
        a('[data-spy="affix"]').each(function() {
          var c = a(this),
            d = c.data();
          (d.offset = d.offset || {}),
            null != d.offsetBottom && (d.offset.bottom = d.offsetBottom),
            null != d.offsetTop && (d.offset.top = d.offsetTop),
            b.call(c, d);
        });
      });
  })(jQuery);
jQuery(document).ready(function($) {
  "use strict";
  function onScrollInit(items, trigger) {
    items.each(function() {
      var classElement = $(this).attr("class");
      var animate = classElement.replace("anim-", "");
      var animateElement = $(this),
        animateAnimationClass = animate[1];
      var animateTrigger = trigger ? trigger : animateElement;
      animateTrigger.waypoint(
        function() {
          animateElement.addClass("animated").addClass(animate);
        },
        {
          triggerOnce: true,
          offset: "90%"
        }
      );
    });
  }
  onScrollInit($(".animate"));
});
!(function(l, e) {
  "function" == typeof define && define.amd
    ? define(["jquery"], e)
    : e(l.jQuery);
})(this, function(l) {
  "use strict";
  function e(e) {
    if (t.webkit && !e) return { height: 0, width: 0 };
    if (!t.data.outer) {
      var o = {
        border: "none",
        "box-sizing": "content-box",
        height: "200px",
        margin: "0",
        padding: "0",
        width: "200px"
      };
      (t.data.inner = l("<div>").css(l.extend({}, o))),
        (t.data.outer = l("<div>")
          .css(
            l.extend(
              {
                left: "-1000px",
                overflow: "scroll",
                position: "absolute",
                top: "-1000px"
              },
              o
            )
          )
          .append(t.data.inner)
          .appendTo("body"));
    }
    return (
      t.data.outer.scrollLeft(1e3).scrollTop(1e3),
      {
        height: Math.ceil(
          t.data.outer.offset().top - t.data.inner.offset().top || 0
        ),
        width: Math.ceil(
          t.data.outer.offset().left - t.data.inner.offset().left || 0
        )
      }
    );
  }
  function o() {
    var l = e(!0);
    return !(l.height || l.width);
  }
  function s(l) {
    var e = l.originalEvent;
    return e.axis && e.axis === e.HORIZONTAL_AXIS
      ? !1
      : e.wheelDeltaX
      ? !1
      : !0;
  }
  var r = !1,
    t = {
      data: { index: 0, name: "scrollbar" },
      macosx: /mac/i.test(navigator.platform),
      mobile: /android|webos|iphone|ipad|ipod|blackberry/i.test(
        navigator.userAgent
      ),
      overlay: null,
      scroll: null,
      scrolls: [],
      webkit:
        /webkit/i.test(navigator.userAgent) &&
        !/edge\/\d+/i.test(navigator.userAgent)
    };
  (t.scrolls.add = function(l) {
    this.remove(l).push(l);
  }),
    (t.scrolls.remove = function(e) {
      for (; l.inArray(e, this) >= 0; ) this.splice(l.inArray(e, this), 1);
      return this;
    });
  var i = {
      autoScrollSize: !0,
      autoUpdate: !0,
      debug: !1,
      disableBodyScroll: !1,
      duration: 200,
      ignoreMobile: !1,
      ignoreOverlay: !1,
      scrollStep: 30,
      showArrows: !1,
      stepScrolling: !0,
      scrollx: null,
      scrolly: null,
      onDestroy: null,
      onInit: null,
      onScroll: null,
      onUpdate: null
    },
    n = function(s) {
      t.scroll ||
        ((t.overlay = o()),
        (t.scroll = e()),
        a(),
        l(window).resize(function() {
          var l = !1;
          if (t.scroll && (t.scroll.height || t.scroll.width)) {
            var o = e();
            (o.height !== t.scroll.height || o.width !== t.scroll.width) &&
              ((t.scroll = o), (l = !0));
          }
          a(l);
        })),
        (this.container = s),
        (this.namespace = ".scrollbar_" + t.data.index++),
        (this.options = l.extend({}, i, window.jQueryScrollbarOptions || {})),
        (this.scrollTo = null),
        (this.scrollx = {}),
        (this.scrolly = {}),
        s.data(t.data.name, this),
        t.scrolls.add(this);
    };
  n.prototype = {
    destroy: function() {
      if (this.wrapper) {
        this.container.removeData(t.data.name), t.scrolls.remove(this);
        var e = this.container.scrollLeft(),
          o = this.container.scrollTop();
        this.container
          .insertBefore(this.wrapper)
          .css({ height: "", margin: "", "max-height": "" })
          .removeClass(
            "scroll-content scroll-scrollx_visible scroll-scrolly_visible"
          )
          .off(this.namespace)
          .scrollLeft(e)
          .scrollTop(o),
          this.scrollx.scroll
            .removeClass("scroll-scrollx_visible")
            .find("div")
            .andSelf()
            .off(this.namespace),
          this.scrolly.scroll
            .removeClass("scroll-scrolly_visible")
            .find("div")
            .andSelf()
            .off(this.namespace),
          this.wrapper.remove(),
          l(document)
            .add("body")
            .off(this.namespace),
          l.isFunction(this.options.onDestroy) &&
            this.options.onDestroy.apply(this, [this.container]);
      }
    },
    init: function(e) {
      var o = this,
        r = this.container,
        i = this.containerWrapper || r,
        n = this.namespace,
        c = l.extend(this.options, e || {}),
        a = { x: this.scrollx, y: this.scrolly },
        d = this.wrapper,
        h = { scrollLeft: r.scrollLeft(), scrollTop: r.scrollTop() };
      if (
        (t.mobile && c.ignoreMobile) ||
        (t.overlay && c.ignoreOverlay) ||
        (t.macosx && !t.webkit)
      )
        return !1;
      if (d)
        i.css({
          height: "auto",
          "margin-bottom": -1 * t.scroll.height + "px",
          "margin-right": -1 * t.scroll.width + "px",
          "max-height": ""
        });
      else {
        if (
          ((this.wrapper = d = l("<div>")
            .addClass("scroll-wrapper")
            .addClass(r.attr("class"))
            .css(
              "position",
              "absolute" == r.css("position") ? "absolute" : "relative"
            )
            .insertBefore(r)
            .append(r)),
          r.is("textarea") &&
            ((this.containerWrapper = i = l("<div>")
              .insertBefore(r)
              .append(r)),
            d.addClass("scroll-textarea")),
          i
            .addClass("scroll-content")
            .css({
              height: "auto",
              "margin-bottom": -1 * t.scroll.height + "px",
              "margin-right": -1 * t.scroll.width + "px",
              "max-height": ""
            }),
          r.on("scroll" + n, function(e) {
            l.isFunction(c.onScroll) &&
              c.onScroll.call(
                o,
                {
                  maxScroll: a.y.maxScrollOffset,
                  scroll: r.scrollTop(),
                  size: a.y.size,
                  visible: a.y.visible
                },
                {
                  maxScroll: a.x.maxScrollOffset,
                  scroll: r.scrollLeft(),
                  size: a.x.size,
                  visible: a.x.visible
                }
              ),
              a.x.isVisible &&
                a.x.scroll.bar.css("left", r.scrollLeft() * a.x.kx + "px"),
              a.y.isVisible &&
                a.y.scroll.bar.css("top", r.scrollTop() * a.y.kx + "px");
          }),
          d.on("scroll" + n, function() {
            d.scrollTop(0).scrollLeft(0);
          }),
          c.disableBodyScroll)
        ) {
          var p = function(l) {
            s(l)
              ? a.y.isVisible && a.y.mousewheel(l)
              : a.x.isVisible && a.x.mousewheel(l);
          };
          d.on("MozMousePixelScroll" + n, p),
            d.on("mousewheel" + n, p),
            t.mobile &&
              d.on("touchstart" + n, function(e) {
                var o =
                    (e.originalEvent.touches && e.originalEvent.touches[0]) ||
                    e,
                  s = { pageX: o.pageX, pageY: o.pageY },
                  t = { left: r.scrollLeft(), top: r.scrollTop() };
                l(document).on("touchmove" + n, function(l) {
                  var e =
                    (l.originalEvent.targetTouches &&
                      l.originalEvent.targetTouches[0]) ||
                    l;
                  r.scrollLeft(t.left + s.pageX - e.pageX),
                    r.scrollTop(t.top + s.pageY - e.pageY),
                    l.preventDefault();
                }),
                  l(document).on("touchend" + n, function() {
                    l(document).off(n);
                  });
              });
        }
        l.isFunction(c.onInit) && c.onInit.apply(this, [r]);
      }
      l.each(a, function(e, t) {
        var i = null,
          d = 1,
          h = "x" === e ? "scrollLeft" : "scrollTop",
          p = c.scrollStep,
          u = function() {
            var l = r[h]();
            r[h](l + p),
              1 == d && l + p >= f && (l = r[h]()),
              -1 == d && f >= l + p && (l = r[h]()),
              r[h]() == l && i && i();
          },
          f = 0;
        t.scroll ||
          ((t.scroll = o._getScroll(c["scroll" + e]).addClass("scroll-" + e)),
          c.showArrows && t.scroll.addClass("scroll-element_arrows_visible"),
          (t.mousewheel = function(l) {
            if (!t.isVisible || ("x" === e && s(l))) return !0;
            if ("y" === e && !s(l)) return a.x.mousewheel(l), !0;
            var i = -1 * l.originalEvent.wheelDelta || l.originalEvent.detail,
              n = t.size - t.visible - t.offset;
            return (
              ((i > 0 && n > f) || (0 > i && f > 0)) &&
                ((f += i),
                0 > f && (f = 0),
                f > n && (f = n),
                (o.scrollTo = o.scrollTo || {}),
                (o.scrollTo[h] = f),
                setTimeout(function() {
                  o.scrollTo &&
                    (r.stop().animate(o.scrollTo, 240, "linear", function() {
                      f = r[h]();
                    }),
                    (o.scrollTo = null));
                }, 1)),
              l.preventDefault(),
              !1
            );
          }),
          t.scroll
            .on("MozMousePixelScroll" + n, t.mousewheel)
            .on("mousewheel" + n, t.mousewheel)
            .on("mouseenter" + n, function() {
              f = r[h]();
            }),
          t.scroll
            .find(".scroll-arrow, .scroll-element_track")
            .on("mousedown" + n, function(s) {
              if (1 != s.which) return !0;
              d = 1;
              var n = {
                  eventOffset: s["x" === e ? "pageX" : "pageY"],
                  maxScrollValue: t.size - t.visible - t.offset,
                  scrollbarOffset: t.scroll.bar.offset()[
                    "x" === e ? "left" : "top"
                  ],
                  scrollbarSize: t.scroll.bar[
                    "x" === e ? "outerWidth" : "outerHeight"
                  ]()
                },
                a = 0,
                v = 0;
              return (
                l(this).hasClass("scroll-arrow")
                  ? ((d = l(this).hasClass("scroll-arrow_more") ? 1 : -1),
                    (p = c.scrollStep * d),
                    (f = d > 0 ? n.maxScrollValue : 0))
                  : ((d =
                      n.eventOffset > n.scrollbarOffset + n.scrollbarSize
                        ? 1
                        : n.eventOffset < n.scrollbarOffset
                        ? -1
                        : 0),
                    (p = Math.round(0.75 * t.visible) * d),
                    (f =
                      n.eventOffset -
                      n.scrollbarOffset -
                      (c.stepScrolling
                        ? 1 == d
                          ? n.scrollbarSize
                          : 0
                        : Math.round(n.scrollbarSize / 2))),
                    (f = r[h]() + f / t.kx)),
                (o.scrollTo = o.scrollTo || {}),
                (o.scrollTo[h] = c.stepScrolling ? r[h]() + p : f),
                c.stepScrolling &&
                  ((i = function() {
                    (f = r[h]()),
                      clearInterval(v),
                      clearTimeout(a),
                      (a = 0),
                      (v = 0);
                  }),
                  (a = setTimeout(function() {
                    v = setInterval(u, 40);
                  }, c.duration + 100))),
                setTimeout(function() {
                  o.scrollTo &&
                    (r.animate(o.scrollTo, c.duration), (o.scrollTo = null));
                }, 1),
                o._handleMouseDown(i, s)
              );
            }),
          t.scroll.bar.on("mousedown" + n, function(s) {
            if (1 != s.which) return !0;
            var i = s["x" === e ? "pageX" : "pageY"],
              c = r[h]();
            return (
              t.scroll.addClass("scroll-draggable"),
              l(document).on("mousemove" + n, function(l) {
                var o = parseInt(
                  (l["x" === e ? "pageX" : "pageY"] - i) / t.kx,
                  10
                );
                r[h](c + o);
              }),
              o._handleMouseDown(function() {
                t.scroll.removeClass("scroll-draggable"), (f = r[h]());
              }, s)
            );
          }));
      }),
        l.each(a, function(l, e) {
          var o = "scroll-scroll" + l + "_visible",
            s = "x" == l ? a.y : a.x;
          e.scroll.removeClass(o), s.scroll.removeClass(o), i.removeClass(o);
        }),
        l.each(a, function(e, o) {
          l.extend(
            o,
            "x" == e
              ? {
                  offset: parseInt(r.css("left"), 10) || 0,
                  size: r.prop("scrollWidth"),
                  visible: d.width()
                }
              : {
                  offset: parseInt(r.css("top"), 10) || 0,
                  size: r.prop("scrollHeight"),
                  visible: d.height()
                }
          );
        }),
        this._updateScroll("x", this.scrollx),
        this._updateScroll("y", this.scrolly),
        l.isFunction(c.onUpdate) && c.onUpdate.apply(this, [r]),
        l.each(a, function(l, e) {
          var o = "x" === l ? "left" : "top",
            s = "x" === l ? "outerWidth" : "outerHeight",
            t = "x" === l ? "width" : "height",
            i = parseInt(r.css(o), 10) || 0,
            n = e.size,
            a = e.visible + i,
            d = e.scroll.size[s]() + (parseInt(e.scroll.size.css(o), 10) || 0);
          c.autoScrollSize &&
            ((e.scrollbarSize = parseInt((d * a) / n, 10)),
            e.scroll.bar.css(t, e.scrollbarSize + "px")),
            (e.scrollbarSize = e.scroll.bar[s]()),
            (e.kx = (d - e.scrollbarSize) / (n - a) || 1),
            (e.maxScrollOffset = n - a);
        }),
        r
          .scrollLeft(h.scrollLeft)
          .scrollTop(h.scrollTop)
          .trigger("scroll");
    },
    _getScroll: function(e) {
      var o = {
        advanced: [
          '<div class="scroll-element">',
          '<div class="scroll-element_corner"></div>',
          '<div class="scroll-arrow scroll-arrow_less"></div>',
          '<div class="scroll-arrow scroll-arrow_more"></div>',
          '<div class="scroll-element_outer">',
          '<div class="scroll-element_size"></div>',
          '<div class="scroll-element_inner-wrapper">',
          '<div class="scroll-element_inner scroll-element_track">',
          '<div class="scroll-element_inner-bottom"></div>',
          "</div>",
          "</div>",
          '<div class="scroll-bar">',
          '<div class="scroll-bar_body">',
          '<div class="scroll-bar_body-inner"></div>',
          "</div>",
          '<div class="scroll-bar_bottom"></div>',
          '<div class="scroll-bar_center"></div>',
          "</div>",
          "</div>",
          "</div>"
        ].join(""),
        simple: [
          '<div class="scroll-element">',
          '<div class="scroll-element_outer">',
          '<div class="scroll-element_size"></div>',
          '<div class="scroll-element_track"></div>',
          '<div class="scroll-bar"></div>',
          "</div>",
          "</div>"
        ].join("")
      };
      return (
        o[e] && (e = o[e]),
        e || (e = o.simple),
        (e = "string" == typeof e ? l(e).appendTo(this.wrapper) : l(e)),
        l.extend(e, {
          bar: e.find(".scroll-bar"),
          size: e.find(".scroll-element_size"),
          track: e.find(".scroll-element_track")
        }),
        e
      );
    },
    _handleMouseDown: function(e, o) {
      var s = this.namespace;
      return (
        l(document).on("blur" + s, function() {
          l(document)
            .add("body")
            .off(s),
            e && e();
        }),
        l(document).on("dragstart" + s, function(l) {
          return l.preventDefault(), !1;
        }),
        l(document).on("mouseup" + s, function() {
          l(document)
            .add("body")
            .off(s),
            e && e();
        }),
        l("body").on("selectstart" + s, function(l) {
          return l.preventDefault(), !1;
        }),
        o && o.preventDefault(),
        !1
      );
    },
    _updateScroll: function(e, o) {
      var s = this.container,
        r = this.containerWrapper || s,
        i = "scroll-scroll" + e + "_visible",
        n = "x" === e ? this.scrolly : this.scrollx,
        c = parseInt(this.container.css("x" === e ? "left" : "top"), 10) || 0,
        a = this.wrapper,
        d = o.size,
        h = o.visible + c;
      (o.isVisible = d - h > 1),
        o.isVisible
          ? (o.scroll.addClass(i), n.scroll.addClass(i), r.addClass(i))
          : (o.scroll.removeClass(i),
            n.scroll.removeClass(i),
            r.removeClass(i)),
        "y" === e &&
          (s.is("textarea") || h > d
            ? r.css({
                height: h + t.scroll.height + "px",
                "max-height": "none"
              })
            : r.css({ "max-height": h + t.scroll.height + "px" })),
        (o.size != s.prop("scrollWidth") ||
          n.size != s.prop("scrollHeight") ||
          o.visible != a.width() ||
          n.visible != a.height() ||
          o.offset != (parseInt(s.css("left"), 10) || 0) ||
          n.offset != (parseInt(s.css("top"), 10) || 0)) &&
          (l.extend(this.scrollx, {
            offset: parseInt(s.css("left"), 10) || 0,
            size: s.prop("scrollWidth"),
            visible: a.width()
          }),
          l.extend(this.scrolly, {
            offset: parseInt(s.css("top"), 10) || 0,
            size: this.container.prop("scrollHeight"),
            visible: a.height()
          }),
          this._updateScroll("x" === e ? "y" : "x", n));
    }
  };
  var c = n;
  (l.fn.scrollbar = function(e, o) {
    return (
      "string" != typeof e && ((o = e), (e = "init")),
      "undefined" == typeof o && (o = []),
      l.isArray(o) || (o = [o]),
      this.not("body, .scroll-wrapper").each(function() {
        var s = l(this),
          r = s.data(t.data.name);
        (r || "init" === e) && (r || (r = new c(s)), r[e] && r[e].apply(r, o));
      }),
      this
    );
  }),
    (l.fn.scrollbar.options = i);
  var a = (function() {
    var l = 0,
      e = 0;
    return function(o) {
      var s, i, n, c, d, h, p;
      for (s = 0; s < t.scrolls.length; s++)
        (c = t.scrolls[s]),
          (i = c.container),
          (n = c.options),
          (d = c.wrapper),
          (h = c.scrollx),
          (p = c.scrolly),
          (o ||
            (n.autoUpdate &&
              d &&
              d.is(":visible") &&
              (i.prop("scrollWidth") != h.size ||
                i.prop("scrollHeight") != p.size ||
                d.width() != h.visible ||
                d.height() != p.visible))) &&
            (c.init(),
            n.debug &&
              (window.console &&
                console.log(
                  {
                    scrollHeight: i.prop("scrollHeight") + ":" + c.scrolly.size,
                    scrollWidth: i.prop("scrollWidth") + ":" + c.scrollx.size,
                    visibleHeight: d.height() + ":" + c.scrolly.visible,
                    visibleWidth: d.width() + ":" + c.scrollx.visible
                  },
                  !0
                ),
              e++));
      r && e > 10
        ? (window.console && console.log("Scroll updates exceed 10"),
          (a = function() {}))
        : (clearTimeout(l), (l = setTimeout(a, 300)));
    };
  })();
  window.angular &&
    !(function(l) {
      l.module("jQueryScrollbar", [])
        .provider("jQueryScrollbar", function() {
          var e = i;
          return {
            setOptions: function(o) {
              l.extend(e, o);
            },
            $get: function() {
              return { options: l.copy(e) };
            }
          };
        })
        .directive("jqueryScrollbar", [
          "jQueryScrollbar",
          "$parse",
          function(l, e) {
            return {
              restrict: "AC",
              link: function(o, s, r) {
                var t = e(r.jqueryScrollbar),
                  i = t(o);
                s.scrollbar(i || l.options).on("$destroy", function() {
                  s.scrollbar("destroy");
                });
              }
            };
          }
        ]);
    })(window.angular);
});
