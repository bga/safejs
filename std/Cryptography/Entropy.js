fix toObject = #(object) {
  if(object == null) {
    -> null
  }
  else {
    -> Object(object)
  }
}

export Class(Object, {
  constructor: #(p) {
    p.ring = Array.new(128){
      for(i: 0 >> $.length) {
        $[i] = 0
      }
    }
    # [http://lxr.free-electrons.com/source/drivers/char/random.c#L469]
    p.twistTable = [
      0x00000000, 0x3b6e20c8, 0x76dc4190, 0x4db26158,
      0xedb88320, 0xd6d6a3e8, 0x9b64c2b0, 0xa00ae278 
    ]    
    p.readShift = 0
  
    # bind event handlers to instance
    (Object.keys(Self.prototype)
      .filter(#(k) {
        -> k.slice(0, 2) == `on`
      })
      .forEach(#(k) {
        p[k] == #(...args) {
          -> Self.prototype[k].apply(p, args)
        }
      })
    )
  }
  onGenericEvent: #(p, e) {
    p.mixString(e.type)
    p.mixU64(Date.now())
    p.mixU64(e.timeStamp)
  }
  
  onKeyDownEvent: #(p, e) {
    p.onGenericEvent(e)
    p.mixU32(e.keyCode)
  }
  onKeyUpEvent: #(p, e) {
    p.onKeyDownEvent(e)
  }
  
  onMouseMoveEvent: #(p, e) {
    p.onGenericEvent(e)
    p.mixU32(e.screenX)
    p.mixU32(e.screenY)
  }
  onMouseDownEvent: #(p, e) {
    p.onMouseMoveEvent(e)
    p.mixU32(e.button)
  }
  onMouseUpEvent: #(p, e) {
    p.onMouseDownEvent(e)
  }
  onMouseWheelEvent: #(p, e) {
    p.onGenericEvent(e)
    e.delta != null && p.mixU32(e.delta)
    e.deltaX != null && p.mixU32(e.deltaX)
    e.deltaY != null && p.mixU32(e.deltaY)
    e.deltaZ != null && p.mixU32(e.deltaZ)
    e.deltaMode != null && p.mixU32(e.deltaMode)
  }
  
  onTouchStartEvent: #(p, e) {
    p.onGenericEvent(e)
    e.changedTouches.forEach(#(touch) {
      p.mixU32(touch.identifier)
      p.mixU32(touch.screenX)
      p.mixU32(touch.screenY)
      p.mixU32(touch.radiusX)
      p.mixU32(touch.radiusY)
      p.mixDouble(touch.rotationAngle)
      toObject(touch.mozPressure) && p.mixDouble(touch.mozPressure)
    })
  }
  onTouchMoveEvent: #(p, e) {
    p.onTouchStartEvent(e)
  }
  onTouchEndEvent: #(p, e) {
    p.onGenericEvent(e)
    e.changedTouches.forEach(#(touch) {
      p.mixU32(touch.identifier)
    })
  }
    
  
  onNetworkEvent: #(p) {
    p.onGenericEvent({
      type: `onNetwork`
      timeStamp: Date.now()
    })
  }
  
  onViewPortEvent: #(p, e) {
    setTimeout(#() {
      fix win = e.target
      p.mixU32(toObject(win.screenLeft) || win.screenX)
      p.mixU32(toObject(win.screenTop) || win.screenY)
      
      fix de = win.document.documentElement
      fix body = win.document.getElementsByTagName(`body`)[0]
      p.mixU32(toObject(win.innerWidth) || toObject(de.clientWidth) || body.clientWidth)
      p.mixU32(toObject(win.innerHeight) || toObject(de.clientHeight) || body.clientHeight)
    }, 0)
  }
  
  onNavigationEvent: #(p, e) {
    p.onGenericEvent(e)
    p.mixString(e.target.location.toString())
  }
  
  onGeoLocationEvent: #(p, pos) {
    p.mixDouble(pos.latitude)
    p.mixDouble(pos.longitude)
    toObject(pos.altitude) && p.mixDouble(pos.altitude)
    p.mixDouble(pos.accuracy)
    toObject(pos.altitudeAccuracy) && p.mixDouble(pos.altitudeAccuracy)
    toObject(pos.heading) && p.mixDouble(pos.heading)
    toObject(pos.speed) && p.mixDouble(pos.speed)
  }
  
  onGeoLocationFailEvent: #(p, error) {
    p.onGenericEvent({
      type: `onGeoLocationFailEvent`
      timeStamp: Date.now()
    })
  }

  
  bindToEnv: #(env) {
    p.mixU32(env.history.length)
    if(env.performance) {
      p.mixU64(env.performance.timing.loadEventEnd)
      p.mixU64(env.performance.timing.loadEventStart)
      p.mixU64(env.performance.timing.domComplete)
      p.mixU64(env.performance.timing.domContentLoadedEventEnd)
      p.mixU64(env.performance.timing.domContentLoadedEventStart)
      p.mixU64(env.performance.timing.domInteractive)
      p.mixU64(env.performance.timing.domLoading)
      p.mixU64(env.performance.timing.responseEnd)
      p.mixU64(env.performance.timing.responseStart)
      p.mixU64(env.performance.timing.requestStart)
      p.mixU64(env.performance.timing.secureConnectionStart)
      p.mixU64(env.performance.timing.connectEnd)
      p.mixU64(env.performance.timing.connectStart)
      p.mixU64(env.performance.timing.domainLookupEnd)
      p.mixU64(env.performance.timing.domainLookupStart)
      p.mixU64(env.performance.timing.fetchStart)
      p.mixU64(env.performance.timing.redirectEnd)
      p.mixU64(env.performance.timing.redirectStart)
      p.mixU64(env.performance.timing.unloadEventEnd)
      p.mixU64(env.performance.timing.unloadEventStart)
      p.mixU64(env.performance.timing.navigationStart)
    }
    
    ? "onsearch", "onwaiting", "ontimeupdate", "onstalled", "onratechange", "onprogress", "onloadstart", "onloadedmetadata", "onloadeddata", "onload", "onerror", "onended", "onemptied"
    
    using(mixin(EventTarget, {
      on: #(p, name, fn) {
        p.addEventListener(name, fn, no)
      }
    }))
    
    env.on(`resize`, p.onViewPortEvent)
    env.on(`deviceorientation`, p.onViewPortEvent)
    env.on(`pageshow`, p.onViewPortEvent)
    env.on(`pagehide`, p.onViewPortEvent)
    
    env.on(`online`, p.onNetworkEvent)
    env.on(`offline`, p.onNetworkEvent)

    env.on(`hashchange`, p.onNavigationEvent)
    env.on(`popstate`, p.onNavigationEvent)
    
    env.document.on(`mousewheel`, p.onMouseWheelEvent)
    env.document.on(`wheel`, p.onMouseWheelEvent)
    env.document.on(`DOMMouseScroll`, p.onMouseWheelEvent)
    env.document.on(`mouseup`, p.onMouseUpEvent)
    env.document.on(`mousedown`, p.onMouseDownEvent)
    env.document.on(`mousemove`, p.onMouseMoveEvent)

    env.document.on(`keydown`, p.onKeyDownEvent)
    env.document.on(`keyup`, p.onKeyUpEvent)
   
    env.document.on(`touchstart`, p.onTouchStartEvent)
    env.document.on(`touchmove`, p.onTouchMoveEvent)
    env.document.on(`touchend`, p.onTouchEndEvent)
    
    # assuming that storage synch event occurs in random time
    env.on(`storage`, p.onGenericEvent)
    
    fix me = p
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition = $f{
        fix old = $
        $ = #(p, onOk, onFail ?= null, opts ?= {  }) {
          -> old.apply(p, 
            #(p, pos) {
              me.onGeoLocationEvent(pos)
              -> onOk.apply(p, [pos])
            }, 
            # user's refuse is intercation too
            #(p, error) {
              me.onGeoLocationFailEvent(error)
              -> onFail && onFail.apply(p, [error])
            },
            opts
          )
        }
      }

      navigator.geolocation.watchPosition = $f{
        fix old = $
        $ = #(p, onOk, onFail ?= null, opts ?= {  }) {
          -> old.apply(p, 
            #(p, pos) {
              me.onGeoLocationEvent(pos)
              -> onOk.apply(p, [pos])
            }, 
            # user's refuse is intercation too
            #(p, error) {
              me.onGeoLocationFailEvent(error)
              -> onFail && onFail.apply(p, [error])
            },
            opts
          )
        }
      }
    }
    
    ? warp Image, Link, XHR
  }
  bindToDoc: #(doc) {
    
  }
  
})


