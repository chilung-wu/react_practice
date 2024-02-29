from dotenv import load_dotenv
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import time
load_dotenv()
login_url = "https://ecvip.pchome.com.tw/login/v3/login.htm"
# test_url = "https://ecvip.pchome.com.tw/login/v3/login.htm"
order_url = "https://ecvip.pchome.com.tw/web/order/all"
home_url = "https://ecvip.pchome.com.tw/"
username = os.getenv("username")
password = os.getenv("password")

The_End_page = False

# 訂單編號 日期 訂單狀態 總價 付款 配送狀態


# problemlist_url = "https://leetcode.com/problemset/all/"

options = webdriver.ChromeOptions()
options.binary_location = "/usr/bin/google-chrome-stable"
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

# # Adding headless mode to run the browser in the background
options.add_argument("--headless")


def main():
    driver = webdriver.Chrome(options=options)

    try:
        driver.get(login_url)
        usernameInput = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "loginAcc"))
        )
        passwordInput = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "loginPwd"))
        )

        usernameInput.send_keys(username)
        signinBtn = driver.find_element(By.ID, "btnKeep")
        signinBtn.send_keys(Keys.ENTER)

        # 等待密碼輸入框可互動
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "loginPwd"))
        )
        passwordInput.send_keys(password)

        signinBtn = driver.find_element(By.ID, "btnLogin")
        signinBtn.send_keys(Keys.ENTER)

        WebDriverWait(driver, 10).until(
            EC.url_to_be(home_url)
        )

        driver.get(order_url)
        # WebDriverWait(driver, 10).until(
        #     EC.presence_of_element_located((By.ID, "listOrder"))
        # )

        time.sleep(3)  # load order page

        # Initialize an empty list to store dictionaries
        orders = []
        The_End_page = False

        # Define a function to check if the "下一頁" text is present
        def has_next_page():
            try:
                driver.find_element(By.XPATH, '//span[@id="next_page"]/a[text()="下一頁"]').click()
                time.sleep(2)
                return True
            except:
                return False

        def has_next_page_and_click(driver):
            try:
                next_page_btn = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, '//span[@id="next_page"]/a[text()="下一頁"]'))
                )
                next_page_btn.click()

                WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.ID, "listOrder"))
                )
                return True
            except:
                return False


        def extract_order_info(table):
            orders = []
            rows = table.find_elements(By.CSS_SELECTOR, "tr.content_tr")
            for row in rows:
                cells = row.find_elements(By.CSS_SELECTOR, "td")
                if len(cells) < 5:
                    continue
                order_info = {
                    '訂單編號': cells[0].text,
                    '日期': cells[1].text,
                    '訂單狀態': cells[2].text,
                    '總價': cells[3].text,
                    '付款': cells[4].text,
                    '配送狀態': cells[5].text,
                }
                orders.append(order_info)
            return orders


        Has_Next_page = True

        while Has_Next_page:
            # Find the div with id "listOrder"
            list_order_div = driver.find_element(By.ID, "listOrder")
            # Find all the tables with class "order_table_y" within the div
            tables = list_order_div.find_elements(By.CSS_SELECTOR, "table.order_table_y")
            # Loop through each table and extract information
            for table in tables:
                orders += extract_order_info(table)
            
            # Check if the "下一頁" link exists
            Has_Next_page = has_next_page_and_click(driver)
            # Has_Next_page = has_next_page()
            
        # Print the list of orders
        print(f'Total numbers of orders: {len(orders)}')
        for order in orders:
            print(order)
            
        # ... rest of your code ...

    except Exception as e:
        print("An error occurred:", e)

    finally:
        driver.quit()


if __name__ == "__main__":
    main()