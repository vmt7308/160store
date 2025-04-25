import sys
import spacy
import pyodbc
import json
import os

# Force UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

# Kết nối MSSQL
def connect_db():
    conn = pyodbc.connect(
        "DRIVER={SQL Server};"
        f"SERVER={os.getenv('DB_SERVER', 'localhost')};"
        f"DATABASE={os.getenv('DB_DATABASE', '160storeDB')};"
        f"UID={os.getenv('DB_USER', 'sa')};"
        f"PWD={os.getenv('DB_PASSWORD', 'Trung1999!')}"
    )
    return conn

# Phân tích tin nhắn
nlp = spacy.load("en_core_web_sm")  # Hoặc tải mô hình tiếng Việt nếu cần

def extract_intent_and_entities(message):
    doc = nlp(message.lower())
    intent = "unknown"
    entities = {"product": None, "category": None}

    # Phân tích ý định cơ bản
    if any(word in message for word in ["find", "search", "look for", "product"]):
        intent = "search_product"
    elif any(word in message for word in ["category", "categories"]):
        intent = "list_categories"
    elif any(word in message for word in ["price", "cost"]):
        intent = "check_price"

    # Trích xuất thực thể
    for token in doc:
        if token.text in ["shirt", "polo", "jeans", "shorts"]:  # Ví dụ sản phẩm
            entities["product"] = token.text
        if token.text in ["new", "hot", "summer", "combo"]:  # Ví dụ danh mục
            entities["category"] = token.text

    return intent, entities

# Xử lý truy vấn cơ sở dữ liệu
def process_query(intent, entities):
    conn = connect_db()
    cursor = conn.cursor()

    if intent == "search_product":
        product = entities.get("product")
        category = entities.get("category")
        query = "SELECT TOP 5 ProductName, Price, ImageURL FROM Products WHERE 1=1"
        params = []

        if product:
            query += " AND ProductName LIKE ?"
            params.append(f"%{product}%")
        if category:
            query += " AND CategoryID IN (SELECT CategoryID FROM Categories WHERE CategoryName LIKE ?)"
            params.append(f"%{category}%")

        cursor.execute(query, params)
        results = cursor.fetchall()
        if results:
            response = "Tôi tìm thấy các sản phẩm sau:\n"
            for row in results:
                response += f"- {row.ProductName}: {row.Price}₫\n"
        else:
            response = "Không tìm thấy sản phẩm phù hợp."

    elif intent == "list_categories":
        cursor.execute("SELECT CategoryName FROM Categories")
        categories = cursor.fetchall()
        response = "Các danh mục sản phẩm:\n" + "\n".join([f"- {cat.CategoryName}" for cat in categories])

    elif intent == "check_price":
        product = entities.get("product")
        if product:
            cursor.execute(
                "SELECT ProductName, Price FROM Products WHERE ProductName LIKE ?",
                (f"%{product}%",)
            )
            result = cursor.fetchone()
            if result:
                response = f"Giá của {result.ProductName} là {result.Price}₫"
            else:
                response = "Không tìm thấy sản phẩm."
        else:
            response = "Vui lòng cung cấp tên sản phẩm để kiểm tra giá."

    else:
        response = "Xin lỗi, tôi chưa hiểu yêu cầu của bạn. Bạn muốn tìm sản phẩm, danh mục, hay kiểm tra giá?"

    conn.close()
    return response

def main():
    # Nhận tin nhắn từ Node.js
    message = sys.argv[1] if len(sys.argv) > 1 else ""
    if not message:
        print("Vui lòng gửi một tin nhắn!")
        return

    # Xử lý tin nhắn
    intent, entities = extract_intent_and_entities(message)
    response = process_query(intent, entities)
    # Print the response with explicit UTF-8 encoding
    print(response.encode('utf-8').decode('utf-8'))

if __name__ == "__main__":
    main()