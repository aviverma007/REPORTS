#!/usr/bin/env python3
"""
SmartWorld Analytics Backend API Test Suite
Tests all endpoints for the analytics portal application
"""

import requests
import sys
import json
from datetime import datetime
import os

class SmartWorldAPITester:
    def __init__(self, base_url="https://dev-sandbox-180.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_root_endpoint(self):
        """Test GET /api/ - root endpoint returns message"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "message" in data and "SmartWorld" in data["message"]
                details = f"Status: {response.status_code}, Response: {data}"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Root endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Root endpoint", False, str(e))
            return False

    def test_stats_endpoint(self):
        """Test GET /api/stats - returns stats with required fields"""
        try:
            response = requests.get(f"{self.api_url}/stats", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["wbs_elements", "purchase_orders", "total_budget", "plants", "report_modules"]
                missing_fields = [field for field in required_fields if field not in data]
                success = len(missing_fields) == 0
                details = f"Status: {response.status_code}, Missing fields: {missing_fields}" if missing_fields else f"Status: {response.status_code}, All fields present"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Stats endpoint", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Stats endpoint", False, str(e))
            return False, {}

    def test_modules_endpoint(self):
        """Test GET /api/modules - returns 8 module objects"""
        try:
            response = requests.get(f"{self.api_url}/modules", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list) and len(data) == 8
                # Check if first module has required fields
                if success and len(data) > 0:
                    required_fields = ["id", "title", "description", "icon", "status"]
                    missing_fields = [field for field in required_fields if field not in data[0]]
                    success = len(missing_fields) == 0
                details = f"Status: {response.status_code}, Modules count: {len(data) if isinstance(data, list) else 'Not a list'}"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Modules endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Modules endpoint", False, str(e))
            return False

    def test_filters_endpoint(self):
        """Test GET /api/filters - returns filter arrays"""
        try:
            response = requests.get(f"{self.api_url}/filters", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["plants", "wbs_elements", "purchasing_documents", "years"]
                missing_fields = [field for field in required_fields if field not in data]
                success = len(missing_fields) == 0
                details = f"Status: {response.status_code}, Missing fields: {missing_fields}" if missing_fields else f"Status: {response.status_code}, All filter arrays present"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Filters endpoint", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Filters endpoint", False, str(e))
            return False, {}

    def test_data_endpoint(self):
        """Test GET /api/data - returns full dashboard data"""
        try:
            response = requests.get(f"{self.api_url}/data", timeout=15)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["kpi", "monthly_trend", "plant_data", "wbs_budget_top", "yearly_data", "wbs_ordered_top", "plant_utilization", "wbs_table"]
                missing_fields = [field for field in required_fields if field not in data]
                success = len(missing_fields) == 0
                details = f"Status: {response.status_code}, Missing fields: {missing_fields}" if missing_fields else f"Status: {response.status_code}, All data fields present"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Data endpoint", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Data endpoint", False, str(e))
            return False, {}

    def test_data_filtering(self, filters_data):
        """Test GET /api/data with filtering parameters"""
        if not filters_data:
            self.log_test("Data filtering (no filter data)", False, "No filter data available")
            return False

        # Test plant filtering
        try:
            plants = filters_data.get("plants", [])
            if plants:
                plant = plants[0]
                response = requests.get(f"{self.api_url}/data", params={"plant": plant}, timeout=15)
                success = response.status_code == 200
                details = f"Plant filter test - Status: {response.status_code}"
                self.log_test("Data filtering by plant", success, details)
            else:
                self.log_test("Data filtering by plant", False, "No plants available for testing")
        except Exception as e:
            self.log_test("Data filtering by plant", False, str(e))

        # Test project type filtering
        try:
            response = requests.get(f"{self.api_url}/data", params={"proj_type": "Project"}, timeout=15)
            success = response.status_code == 200
            details = f"Project type filter test - Status: {response.status_code}"
            self.log_test("Data filtering by project type", success, details)
        except Exception as e:
            self.log_test("Data filtering by project type", False, str(e))

    def test_download_endpoint(self):
        """Test GET /api/download - downloads current Excel file"""
        try:
            response = requests.get(f"{self.api_url}/download", timeout=15)
            success = response.status_code == 200
            if success:
                # Check if it's actually an Excel file
                content_type = response.headers.get('content-type', '')
                success = 'spreadsheet' in content_type or 'excel' in content_type or len(response.content) > 1000
                details = f"Status: {response.status_code}, Content-Type: {content_type}, Size: {len(response.content)} bytes"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Download endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Download endpoint", False, str(e))
            return False

    def test_upload_endpoint(self):
        """Test POST /api/upload with current Excel file"""
        try:
            # First download the current file
            download_response = requests.get(f"{self.api_url}/download", timeout=15)
            if download_response.status_code != 200:
                self.log_test("Upload endpoint (download first)", False, "Could not download current file for upload test")
                return False

            # Now upload it back
            files = {'file': ('ZALR.xlsx', download_response.content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
            response = requests.post(f"{self.api_url}/upload", files=files, timeout=30)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "message" in data and "rows_count" in data
                details = f"Status: {response.status_code}, Response: {data}"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Upload endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Upload endpoint", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting SmartWorld Analytics Backend API Tests")
        print(f"Testing against: {self.api_url}")
        print("=" * 60)

        # Test basic endpoints
        self.test_root_endpoint()
        stats_success, stats_data = self.test_stats_endpoint()
        self.test_modules_endpoint()
        filters_success, filters_data = self.test_filters_endpoint()
        data_success, data_response = self.test_data_endpoint()

        # Test filtering if data endpoint works
        if filters_success:
            self.test_data_filtering(filters_data)

        # Test file operations
        self.test_download_endpoint()
        self.test_upload_endpoint()

        # Print summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed")
            return 1

def main():
    """Main test runner"""
    tester = SmartWorldAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())