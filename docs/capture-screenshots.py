#!/usr/bin/env python3
"""Capture demo-mode screenshots for the public README. No real cameras."""
from __future__ import annotations

import tempfile
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

OUT = Path(__file__).resolve().parent / "screenshots"
URL = "http://127.0.0.1:18081/"
GECKO = "/tmp/geckodriver"
FIREFOX = "/usr/bin/firefox"


def wait_css(drv, sel, t=15):
    return WebDriverWait(drv, t).until(EC.presence_of_element_located((By.CSS_SELECTOR, sel)))


def shot(drv, name):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    drv.save_screenshot(str(path))
    print("wrote", path.name, path.stat().st_size)


def main():
    profile = tempfile.mkdtemp(prefix="yk-gh-")
    opts = Options()
    opts.add_argument("-headless")
    opts.add_argument("-width=1440")
    opts.add_argument("-height=900")
    opts.add_argument("-profile")
    opts.add_argument(profile)
    opts.binary_location = FIREFOX
    drv = webdriver.Firefox(service=Service(GECKO), options=opts)
    drv.set_window_size(1440, 900)
    try:
        drv.get(URL)
        wait_css(drv, ".gate-card")
        time.sleep(0.5)
        shot(drv, "login.png")

        drv.find_element(By.CSS_SELECTOR, "[data-act=demo]").click()
        wait_css(drv, ".protect, .mosaic, .mtile")
        time.sleep(1.2)
        shot(drv, "live.png")

        drv.get(URL + "#/events")
        wait_css(drv, ".ev-stage, .rail-list")
        time.sleep(0.8)
        shot(drv, "events.png")

        cards = drv.find_elements(By.CSS_SELECTOR, ".ev[data-act=select-ev], .ev[data-act=open-ev]")
        if cards:
            cards[0].click()
            time.sleep(0.8)
            shot(drv, "event-detail.png")
            close_btns = drv.find_elements(By.CSS_SELECTOR, "[data-act=close-pop]")
            if close_btns:
                close_btns[0].click()
                time.sleep(0.3)

        drv.get(URL + "#/replay")
        wait_css(drv, ".replay-shell, .tl")
        time.sleep(1.0)
        shot(drv, "replay.png")

        drv.get(URL + "#/addons")
        wait_css(drv, ".mod-grid")
        time.sleep(0.5)
        shot(drv, "addons.png")

        drv.get(URL + "#/system")
        wait_css(drv, ".sheet, .toolbar")
        time.sleep(0.5)
        shot(drv, "system.png")

        drv.get(URL + "#/home")
        wait_css(drv, ".protect, .mosaic")
        btn = drv.find_element(By.CSS_SELECTOR, "[data-act=toggle-theme]")
        btn.click()
        time.sleep(0.6)
        shot(drv, "live-day.png")

        drv.set_window_size(390, 844)
        time.sleep(0.8)
        shot(drv, "live-mobile.png")
    finally:
        drv.quit()


if __name__ == "__main__":
    main()
