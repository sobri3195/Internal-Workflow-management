#!/bin/bash

echo "==================================="
echo "Workflow Management System Setup"
echo "==================================="
echo ""

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created. Please edit it with your configuration."
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Installing client dependencies..."
cd client && npm install && cd ..

echo ""
echo "==================================="
echo "Setup completed!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database configuration"
echo "2. Create PostgreSQL database: createdb workflow_management"
echo "3. Run migrations: npm run migrate"
echo "4. (Optional) Seed database: npm run seed"
echo "5. Start application: npm run dev"
echo ""
echo "Application will run on:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:5000"
echo ""
