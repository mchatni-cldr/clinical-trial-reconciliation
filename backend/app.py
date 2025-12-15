"""
Flask API for Clinical Trial Payment Reconciliation
REUSABLE with minimal changes per demo
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from services.orchestration_service import ReconciliationOrchestrationService
from config import Config

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

# Validate configuration
Config.validate()
Config.setup_litellm_for_anthropic()

# Initialize orchestration service
orchestration_service = ReconciliationOrchestrationService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Clinical Trial Payment Reconciliation AI'})

@app.route('/api/reconciliation/start', methods=['POST'])
def start_reconciliation():
    """
    Start a new payment reconciliation investigation
    Returns investigation_id for tracking
    """
    try:
        investigation_id = orchestration_service.start_investigation()
        return jsonify({
            'investigation_id': investigation_id,
            'status': 'started',
            'message': 'Payment reconciliation investigation started'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to start investigation'
        }), 500

@app.route('/api/reconciliation/<investigation_id>/status', methods=['GET'])
def get_reconciliation_status(investigation_id: str):
    """
    Get current status of a reconciliation investigation
    Used for polling from frontend
    """
    try:
        status = orchestration_service.get_investigation_status(investigation_id)
        
        if not status:
            return jsonify({
                'error': 'Investigation not found',
                'investigation_id': investigation_id
            }), 404
        
        return jsonify(status.model_dump()), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to retrieve status'
        }), 500

@app.route('/api/reconciliation/<investigation_id>/report', methods=['GET'])
def get_final_report(investigation_id: str):
    """
    Get the final report for a completed investigation
    """
    try:
        status = orchestration_service.get_investigation_status(investigation_id)
        
        if not status:
            return jsonify({
                'error': 'Investigation not found',
                'investigation_id': investigation_id
            }), 404
        
        if status.status != 'complete':
            return jsonify({
                'error': 'Investigation not yet complete',
                'status': status.status
            }), 400
        
        return jsonify({
            'investigation_id': investigation_id,
            'report': status.final_report
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to retrieve report'
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🏥 Clinical Trial Payment Reconciliation AI")
    print("=" * 60)
    print("Server starting on http://localhost:5000")
    print("API Endpoints:")
    print("  POST   /api/reconciliation/start")
    print("  GET    /api/reconciliation/<id>/status")
    print("  GET    /api/reconciliation/<id>/report")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)