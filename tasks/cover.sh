tap --cov --coverage-report=lcov ./tasks/test.js
cd coverage/
git add .
git commit -m "coverage"
