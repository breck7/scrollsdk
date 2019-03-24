tap --cov --coverage-report=lcov ./tasks/test-all.js
cd coverage/
git add .
git commit -m "coverage"
