import os
from mistralai import Mistral
from ..models.contract import ContractSummary, RiskAssessment
from ..config import AIConfig, settings
from typing import List, Dict, Any
import json
import re
import logging
import time
from collections import deque

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    """
    AI Service for contract analysis using Mistral AI
    Designed for scalability and future LangChain integration
    """
    
    def __init__(self):
        """Initialize AI service with configuration"""
        self.config = AIConfig.get_mistral_config()
        self.analysis_config = AIConfig.get_analysis_config()
        
        # Performance tracking for better time estimates
        self.performance_history = deque(maxlen=50)
        self.model_response_times = {
            "mistral-large-latest": {"avg": 18, "min": 10, "max": 35},  # Updated based on actual performance
            "mistral-medium-latest": {"avg": 12, "min": 6, "max": 22}
        }
        
        # Initialize client only if API key is available
        self.client = None
        logger.info(f"API Key configured: {'Yes' if self.config['api_key'] else 'No'}")
        if self.config["api_key"]:
            api_key = self.config['api_key']
            if api_key:
                logger.info(f"API Key (first 10 chars): {api_key[:10]}...")
            else:
                logger.warning("API key is empty string")
            try:
                self.client = Mistral(api_key=self.config["api_key"])
                logger.info(f"AI Service initialized with model: {self.config['model']}")
                logger.info(f"Mistral client type: {type(self.client)}")
                logger.info(f"Available methods: {[m for m in dir(self.client) if not m.startswith('_')]}")
            except Exception as e:
                logger.warning(f"Failed to initialize Mistral client: {e}")
                self.client = None
        else:
            logger.warning("Mistral API key not configured - using mock responses")
    
    # ==================== TIME ESTIMATION ====================
    
    def estimate_analysis_time(self, content_length: int) -> dict:
        """Estimate analysis time based on content length and AI model performance"""
        model = self.config["model"]
        base_time = self.model_response_times.get(model, {"avg": 15})["avg"]
        
        # Adjust based on content length - calibrated with real test data
        if content_length < 1000:
            time_multiplier = 0.6
            complexity = "Simple"
        elif content_length < 3000:
            time_multiplier = 0.9
            complexity = "Medium"  
        elif content_length < 8000:
            time_multiplier = 1.2
            complexity = "Complex"
        elif content_length < 15000:
            time_multiplier = 1.6
            complexity = "Very Complex"
        else:
            time_multiplier = 2.0
            complexity = "Extremely Complex"
        
        estimated_time = int(base_time * time_multiplier * 1.2)  # 20% buffer for total pipeline
        
        return {
            "estimated_seconds": estimated_time,
            "complexity": complexity,
            "content_length": content_length,
            "message": f"Estimated time: {estimated_time} seconds ({complexity} contract)"
        }
    
    def update_performance_history(self, content_length: int, actual_time: float):
        """Update performance history for better future estimates"""
        import time
        try:
            # Determine complexity category - updated to match new thresholds
            if content_length < 1000:
                category = "simple"
            elif content_length < 3000:
                category = "medium"
            elif content_length < 8000:
                category = "complex"
            elif content_length < 15000:
                category = "very_complex"
            else:
                category = "extremely_complex"
            
            # Update model response times based on actual performance
            model = self.config["model"]
            if model in self.model_response_times:
                current_avg = self.model_response_times[model]["avg"]
                # Weighted average: 70% current, 30% new data
                new_avg = int(current_avg * 0.7 + actual_time * 0.3)
                self.model_response_times[model]["avg"] = new_avg
                logger.info(f"Updated {model} average response time to {new_avg}s based on {category} analysis ({actual_time:.1f}s)")
                
            # Keep only last 10 performance records to avoid memory buildup
            self.performance_history.append({
                "content_length": content_length,
                "actual_time": actual_time,
                "timestamp": time.time()
            })
            if len(self.performance_history) > 10:
                self.performance_history = self.performance_history[-10:]
                
        except Exception as e:
            logger.warning(f"Failed to update performance history: {e}")
        
        if len(self.performance_history) >= 5:
            recent_times = [p["actual_time"] for p in list(self.performance_history)[-5:]]
            avg_time = sum(recent_times) / len(recent_times)
            
            model = self.config["model"]
            if model in self.model_response_times:
                self.model_response_times[model]["avg"] = avg_time
                self.model_response_times[model]["min"] = min(recent_times)
                self.model_response_times[model]["max"] = max(recent_times)
    
    def get_performance_stats(self) -> dict:
        """Get current performance statistics for monitoring"""
        if not self.performance_history:
            return {
                "total_analyses": 0,
                "average_time": 0,
                "min_time": 0,
                "max_time": 0,
                "model_performance": self.model_response_times
            }
        
        times = [p["actual_time"] for p in self.performance_history]
        return {
            "total_analyses": len(self.performance_history),
            "average_time": sum(times) / len(times),
            "min_time": min(times),
            "max_time": max(times),
            "model_performance": self.model_response_times,
            "recent_estimates": list(self.performance_history)[-5:]
        }
    
    # ==================== CONTRACT ANALYSIS ====================
    
    def analyze_contract(self, content: str) -> Dict[str, Any]:
        """Analyze contract content and return structured results"""
        import time
        start_time = time.time()
        
        try:
            if not self.client:
                # Force real API usage - no mock fallback
                raise Exception("Mistral AI client not initialized. Please configure MISTRAL_API_KEY in .env file")
            
            # Clean content
            cleaned_content = self._clean_contract_content(content)
            
            # Create analysis prompt
            prompt = self._create_analysis_prompt(cleaned_content)
            
            # Make AI request
            response = self._make_ai_request(prompt)
            
            # Parse response
            analysis_data = self._parse_analysis_response(response)
            
            # Track actual performance for future estimates
            actual_time = time.time() - start_time
            self.update_performance_history(len(content), actual_time)
            logger.info(f"Analysis completed in {actual_time:.2f}s for {len(content)} character document")
            
            return analysis_data
            
        except Exception as e:
            logger.error(f"Contract analysis failed: {e}")
            raise Exception(f"AI analysis failed: {str(e)}. Please ensure MISTRAL_API_KEY is configured.")
    
    def _get_mock_analysis(self, content: str) -> Dict[str, Any]:
        """Get mock analysis when AI service is not available"""
        # Extract some key terms from content for more realistic analysis
        content_lower = content.lower()
        
        # Analyze content for common contract terms
        key_points = []
        risk_assessments = []
        suggested_revisions = []
        
        # Key points based on content analysis
        if "payment" in content_lower or "fee" in content_lower:
            key_points.append("Payment terms and fee structure identified")
        if "termination" in content_lower or "cancel" in content_lower:
            key_points.append("Termination and cancellation clauses present")
        if "liability" in content_lower or "damage" in content_lower:
            key_points.append("Liability and damage limitation clauses found")
        if "confidentiality" in content_lower or "nda" in content_lower:
            key_points.append("Confidentiality and non-disclosure provisions")
        if "intellectual property" in content_lower or "ip" in content_lower:
            key_points.append("Intellectual property rights and ownership")
        
        # Add default points if none found
        if not key_points:
            key_points = [
                "Contract structure and terms reviewed",
                "Standard legal clauses identified",
                "Payment and delivery terms analyzed",
                "Liability and indemnification provisions checked"
            ]
        
        # Risk assessments based on content
        if "unlimited liability" in content_lower:
            risk_assessments.append({
                "risk_level": "high",
                "description": "Unlimited liability clause may expose company to excessive risk",
                "clause_text": "Party shall be liable for unlimited damages",
                "suggestion": "Consider adding liability caps and exclusions for better protection"
            })
        
        if "payment terms" in content_lower and "30 days" not in content_lower:
            risk_assessments.append({
                "risk_level": "medium",
                "description": "Payment terms may need clarification for cash flow management",
                "clause_text": "Payment terms as specified in the agreement",
                "suggestion": "Define specific payment terms and late payment penalties"
            })
        
        if "termination" in content_lower and "notice" not in content_lower:
            risk_assessments.append({
                "risk_level": "medium",
                "description": "Termination clause lacks proper notice requirements",
                "clause_text": "Either party may terminate this agreement",
                "suggestion": "Add specific notice periods and termination procedures"
            })
        
        # Add default risk assessment if none found
        if not risk_assessments:
            risk_assessments.append({
                "risk_level": "low",
                "description": "Standard contract terms with acceptable risk levels",
                "clause_text": "Standard contractual provisions apply",
                "suggestion": "Consider adding specific performance metrics and KPIs"
            })
        
        # Suggested revisions
        if len(content) > 5000:
            suggested_revisions.append("Consider breaking down complex clauses for better clarity")
        if "force majeure" not in content_lower:
            suggested_revisions.append("Add force majeure clause for unforeseen circumstances")
        if "governing law" not in content_lower:
            suggested_revisions.append("Specify governing law and jurisdiction")
        
        # Calculate precise risk score based on content analysis (0-100 scale)
        risk_score = 25.5  # Base score with decimal precision
        
        # Content-based risk factors with precise scoring
        if "unlimited" in content_lower:
            risk_score += 28.3
        if "penalty" in content_lower or "fine" in content_lower:
            risk_score += 18.7
        if "indemnify" in content_lower:
            risk_score += 12.4
        if "termination" in content_lower and "notice" not in content_lower:
            risk_score += 15.2
        if "liability" in content_lower and "limit" not in content_lower:
            risk_score += 22.1
        if "confidentiality" in content_lower and "breach" in content_lower:
            risk_score += 16.8
        if "payment" in content_lower and "30 days" not in content_lower:
            risk_score += 11.3
        if "force majeure" not in content_lower:
            risk_score += 8.9
        if "governing law" not in content_lower:
            risk_score += 7.6
        
        # Add some randomness for more realistic scores
        import random
        risk_score += random.uniform(-3.2, 3.2)
        
        risk_score = max(5.0, min(risk_score, 95.0))  # Keep between 5-95
        
        # Calculate more realistic total clauses based on content length
        content_length = len(content)
        if content_length < 1000:
            total_clauses = 8
        elif content_length < 3000:
            total_clauses = 15
        elif content_length < 6000:
            total_clauses = 25
        else:
            total_clauses = 35
        
        # Add some variation based on content analysis
        if "section" in content_lower or "clause" in content_lower:
            total_clauses += 5
        if "article" in content_lower:
            total_clauses += 3
        if "paragraph" in content_lower:
            total_clauses += 2
        
        return {
            "key_points": key_points,
            "total_clauses": total_clauses,
            "risk_assessments": risk_assessments,
            "suggested_revisions": suggested_revisions,
            "overall_risk_score": risk_score
        }
    
    def _clean_contract_content(self, content: str) -> str:
        """Clean and prepare contract content for analysis"""
        if not content or len(content.strip()) < 10:
            raise Exception("Contract content is too short or empty. Please upload a valid contract file.")
        
        # Remove PDF artifacts and encoding issues
        content = re.sub(r'FlateDecode\s*filter', '', content, flags=re.IGNORECASE)
        content = re.sub(r'\/Filter\s*\/FlateDecode', '', content, flags=re.IGNORECASE)
        content = re.sub(r'\/Length\s*\d+', '', content)
        content = re.sub(r'\/Type\s*\/Page', '', content)
        content = re.sub(r'\/Contents\s*\d+\s*\d+\s*R', '', content)
        content = re.sub(r'\/MediaBox\s*\[[^\]]*\]', '', content)
        content = re.sub(r'\/Parent\s*\d+\s*\d+\s*R', '', content)
        content = re.sub(r'\/Resources\s*\d+\s*\d+\s*R', '', content)
        
        # Remove excessive whitespace but preserve structure
        content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)  # Multiple newlines to double newlines
        content = re.sub(r'[ \t]+', ' ', content)  # Multiple spaces to single space
        
        # Remove special characters that might interfere but keep important punctuation and content
        # Keep more characters that might be in contracts
        content = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\[\]\{\}\"\'\@\#\$\%\&\*\+\=\|\~\`]', '', content)
        
        # Remove binary data patterns but be less aggressive
        content = re.sub(r'[^\x20-\x7E\n\t]', '', content)  # Keep only printable ASCII
        
        # Limit content length but keep more content
        if len(content) > 12000:
            content = content[:12000] + "..."
        
        cleaned = content.strip()
        
        # Check if we have meaningful content after cleaning
        if len(cleaned) < 100:  # Increased minimum length
            raise Exception("Unable to extract meaningful text from the PDF. The file may be corrupted, password-protected, or contain only images.")
        
        return cleaned
    
    def _create_analysis_prompt(self, content: str) -> str:
        """Create analysis prompt for AI with enhanced risk scoring variability"""
        
        # Add content-specific context for more varied analysis
        content_length = len(content)
        content_sample = content[:500].lower()
        
        # Determine contract complexity for more nuanced scoring
        complexity_indicators = [
            "whereas" in content_sample,
            "liability" in content_sample,
            "indemnif" in content_sample,
            "termination" in content_sample,
            "intellectual property" in content_sample,
            "confidential" in content_sample
        ]
        complexity_score = sum(complexity_indicators)
        
        complexity_guidance = ""
        if complexity_score <= 2:
            complexity_guidance = "This appears to be a simpler contract. Risk scores should typically range 15-45 unless specific high-risk clauses are present."
        elif complexity_score <= 4:
            complexity_guidance = "This appears to be a moderately complex contract. Risk scores should typically range 30-70 based on specific risk factors."
        else:
            complexity_guidance = "This appears to be a complex contract. Risk scores should typically range 45-85 based on comprehensive risk analysis."
        
        return f"""Analyze this contract thoroughly and provide detailed JSON analysis. Pay special attention to providing VARIED and REALISTIC risk scores based on actual contract content.

CONTRACT:
{content}

Contract Analysis Context:
- Document length: {content_length} characters
- Complexity assessment: {complexity_guidance}

Provide comprehensive JSON analysis in this EXACT format:
{{
    "key_points": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"],
    "total_clauses": <count_all_contract_clauses_and_sections>,
    "risk_assessments": [
        {{
            "risk_level": "low/medium/high",
            "description": "detailed risk description",
            "clause_text": "specific clause text",
            "suggestion": "concrete improvement suggestion"
        }}
    ],
    "suggested_revisions": ["revision 1", "revision 2", "revision 3"],
    "overall_risk_score": <precise_decimal_score_between_5-95>
}}

CRITICAL RISK SCORING REQUIREMENTS:
- NEVER use round numbers (avoid 65, 70, 75, etc.)
- Always use precise decimals (e.g., 47.3, 62.8, 73.2)
- Base the score on ACTUAL contract content analysis
- Different contracts MUST have different scores reflecting their unique risk profiles
- Consider: liability caps, termination clauses, payment terms, intellectual property, indemnification, governing law, dispute resolution
- Weight high-risk clauses more heavily in scoring
- {complexity_guidance}

Analysis Requirements:
- Count ALL clauses, sections, and paragraphs
- Provide 8-12 detailed risk assessments
- Include specific clause analysis for: payment terms, termination, liability, IP, confidentiality, dispute resolution, compliance
- Score must reflect the SPECIFIC risks found in THIS contract

Return ONLY valid JSON:"""}
    
    def _make_ai_request(self, prompt: str) -> str:
        """Make request to Mistral AI using direct HTTP API"""
        try:
            import requests
            
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.config['api_key']}",
                "Content-Type": "application/json"
            }
            # Add variability to prevent identical responses
            import random
            import hashlib
            
            # Create a seed based on content hash for consistent but varied responses
            content_hash = hashlib.md5(prompt.encode()).hexdigest()
            seed_value = int(content_hash[:8], 16) % 1000
            
            # Use higher temperature for more variability
            temperature = 0.7 + (seed_value % 100) / 1000  # Range: 0.7-0.8
            
            data = {
                "model": self.config["model"],
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "max_tokens": 2500,  # Increased for more detailed analysis
                "stream": False,  # Ensure no streaming for faster response
                "random_seed": seed_value  # Ensure reproducible but varied results
            }
            
            logger.info(f"Making HTTP request to Mistral AI")
            api_key = self.config['api_key']
            if api_key:
                logger.info(f"API Key (first 10 chars): {api_key[:10]}...")
            else:
                logger.warning("API key is empty string")
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Response received successfully")
            return result["choices"][0]["message"]["content"]
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                logger.error("Rate limit exceeded. Please wait before making another request.")
                raise Exception("AI service is temporarily overloaded. Please wait a moment and try again.")
            elif e.response.status_code == 401:
                logger.error("Unauthorized access to Mistral AI. Please check API key.")
                raise Exception("AI service authentication failed. Please check your API configuration.")
            else:
                logger.error(f"HTTP Error: {e}")
                raise Exception(f"AI service error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"AI request failed: {e}")
            logger.error(f"Exception type: {type(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Don't use mock fallback - show real error
            raise Exception(f"AI analysis failed: {str(e)}")
    
    def _parse_analysis_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response into structured data with risk score validation"""
        try:
            logger.info(f"Raw AI response: {response_text[:500]}...")
            
            # Clean response text
            cleaned_response = response_text.strip()
            
            # Remove markdown code blocks if present
            if '```json' in cleaned_response:
                json_match = re.search(r'```json\s*(.*?)\s*```', cleaned_response, re.DOTALL)
                if json_match:
                    cleaned_response = json_match.group(1).strip()
            elif '```' in cleaned_response:
                json_match = re.search(r'```\s*(.*?)\s*```', cleaned_response, re.DOTALL)
                if json_match:
                    cleaned_response = json_match.group(1).strip()
            
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                
                # Fix common truncation issues
                json_str = self._fix_truncated_json(json_str)
                
                parsed_data = json.loads(json_str)
                
                # Validate and enhance risk score for uniqueness
                parsed_data = self._ensure_unique_risk_score(parsed_data, response_text)
                
                logger.info(f"Successfully parsed AI response with risk score: {parsed_data.get('overall_risk_score')}")
                return parsed_data
            else:
                logger.error("No JSON found in AI response")
                # Don't fallback to mock - raise error to debug
                raise Exception(f"No valid JSON found in AI response: {response_text[:200]}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            logger.error(f"Response text: {response_text[:500]}")
            raise Exception(f"Failed to decode JSON from AI response: {e}")
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}")
            logger.error(f"Response text: {response_text[:500]}")
            raise Exception(f"Failed to parse AI response: {e}")
    
    def _ensure_unique_risk_score(self, parsed_data: Dict[str, Any], original_text: str) -> Dict[str, Any]:
        """Ensure risk scores are unique and realistic based on content analysis"""
        import hashlib
        import random
        
        # Get the risk score from parsed data
        risk_score = parsed_data.get('overall_risk_score', 50.0)
        
        # Create content-based variation
        content_hash = hashlib.md5(original_text.encode()).hexdigest()
        hash_value = int(content_hash[:8], 16) % 10000
        
        # Add content-based decimal variation (0.1 to 9.9)
        decimal_variation = (hash_value % 99) / 10.0 + 0.1
        
        # Ensure we don't have round numbers by adding decimal precision
        if isinstance(risk_score, (int, float)):
            if risk_score == int(risk_score):  # If it's a round number
                risk_score = float(risk_score) + decimal_variation
        
        # Ensure score is within valid range
        risk_score = max(5.0, min(95.0, float(risk_score)))
        
        # Round to one decimal place for clean display
        risk_score = round(risk_score, 1)
        
        parsed_data['overall_risk_score'] = risk_score
        
        logger.info(f"Enhanced risk score from {parsed_data.get('overall_risk_score')} to {risk_score} with content-based variation")
        
        return parsed_data
    
    def _fix_truncated_json(self, json_str: str) -> str:
        """Fix common JSON truncation issues"""
        try:
            # If JSON ends with incomplete string, close it properly
            if json_str.rstrip().endswith('"'):
                return json_str
            
            # Find the last complete field and truncate there
            lines = json_str.split('\n')
            valid_lines = []
            brace_count = 0
            quote_count = 0
            in_string = False
            
            for line in lines:
                for char in line:
                    if char == '"' and (not valid_lines or valid_lines[-1][-1:] != '\\'):
                        in_string = not in_string
                    elif not in_string:
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                
                # If we're in a valid state, add the line
                if not in_string and brace_count >= 0:
                    valid_lines.append(line)
                else:
                    # Stop at the first problematic line
                    break
            
            # Reconstruct JSON and ensure proper closing
            result = '\n'.join(valid_lines)
            
            # Count open braces and close them
            open_braces = result.count('{') - result.count('}')
            if open_braces > 0:
                result += '\n' + '}' * open_braces
            
            # Ensure last field doesn't end with comma
            result = re.sub(r',(\s*})', r'\1', result)
            
            return result
            
        except Exception as e:
            logger.warning(f"Failed to fix JSON truncation: {e}")
            return json_str
    
    def _create_contract_summary(self, analysis_data: Dict[str, Any], content: str) -> ContractSummary:
        """Create structured contract summary from analysis data"""
        risk_assessments = []
        for risk in analysis_data.get('risk_assessments', []):
            risk_assessments.append(RiskAssessment(
                risk_level=risk.get('risk_level', 'medium'),
                description=risk.get('description', ''),
                clause_text=risk.get('clause_text', ''),
                suggestion=risk.get('suggestion', '')
            ))
        
        # Better clause counting - count sections, paragraphs, and significant clauses
        content_lower = content.lower()
        
        # Count various contract elements
        section_count = content.count('SECTION') + content.count('Section') + content.count('section')
        clause_count = content.count('CLAUSE') + content.count('Clause') + content.count('clause')
        article_count = content.count('ARTICLE') + content.count('Article') + content.count('article')
        paragraph_count = len([p for p in content.split('\n\n') if len(p.strip()) > 50])
        
        # Count numbered items (1., 2., etc.)
        numbered_items = len(re.findall(r'\d+\.', content))
        
        # Use AI-provided total_clauses if available, otherwise calculate
        ai_total_clauses = analysis_data.get('total_clauses', 0)
        if ai_total_clauses > 0:
            total_clauses = ai_total_clauses
        else:
            # Fallback calculation
            total_clauses = max(
                section_count + clause_count + article_count,
                paragraph_count,
                numbered_items,
                5  # Minimum reasonable count
            )
        
        return ContractSummary(
            key_points=analysis_data.get('key_points', []),
            total_clauses=total_clauses,
            risk_assessments=risk_assessments,
            suggested_revisions=analysis_data.get('suggested_revisions', []),
            overall_risk_score=float(analysis_data.get('overall_risk_score', 5.0))
        )
    
    # ==================== Q&A FUNCTIONALITY ====================
    
    async def answer_question(self, question: str, contract_content: str, analysis_summary: ContractSummary) -> dict:
        """Answer specific questions about the contract using AI"""
        if not self.client:
            raise Exception("AI service is not configured. Please check your API settings.")
        
        try:
            logger.info(f"Processing question: {question[:50]}...")
            return await self._answer_with_mistral(question, contract_content, analysis_summary)
        except Exception as e:
            logger.error(f"AI Q&A Error: {str(e)}")
            error_message = self._get_user_friendly_error(str(e))
            
            return {
                "answer": error_message,
                "relevant_sections": [],
                "page_references": []
            }
    
    async def _answer_with_mistral(self, question: str, contract_content: str, analysis_summary: ContractSummary) -> dict:
        """Answer question using Mistral AI"""
        cleaned_content = self._clean_contract_content(contract_content)
        qa_prompt = self._create_qa_prompt(question, cleaned_content, analysis_summary)
        
        try:
            import requests
            
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.config['api_key']}",
                "Content-Type": "application/json"
            }
            data = {
                "model": self.config["model"],
                "messages": [{"role": "user", "content": qa_prompt}],
                "temperature": 0.2,  # Lower temperature for more focused responses
                "max_tokens": 600,  # Shorter responses for better UX
                "stream": False
            }
            
            logger.info(f"Making Q&A request to Mistral AI for question: {question[:50]}...")
            api_key = self.config['api_key']
            if api_key:
                logger.info(f"API Key (first 10 chars): {api_key[:10]}...")
            else:
                logger.warning("API key is empty string")
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 401:
                logger.error("Mistral AI authentication failed. Check API key.")
                raise Exception("AI service authentication failed. Please check your API configuration.")
            elif response.status_code == 429:
                logger.error("Rate limit exceeded for Mistral AI.")
                raise Exception("AI service is temporarily overloaded. Please wait a moment and try again.")
            
            response.raise_for_status()
            
            result = response.json()
            response_text = result["choices"][0]["message"]["content"]
            
            # Check if AI returned an error message as content
            error_phrases = [
                "an error occurred while processing",
                "unable to process your request",
                "service is temporarily unavailable",
                "please try again later",
                "internal server error",
                "request could not be completed"
            ]
            
            if any(phrase in response_text.lower() for phrase in error_phrases):
                logger.warning(f"AI returned error message as content: {response_text[:100]}...")
                raise Exception("AI service is currently experiencing issues. Please try again in a moment.")
            
            result = self._parse_qa_response(response_text, question)
            logger.info("Q&A response generated successfully")
            return result
            
        except requests.exceptions.HTTPError as e:
            logger.error(f"Q&A HTTP Error: {e}")
            if e.response.status_code == 401:
                raise Exception("AI service authentication failed. Please check your API configuration.")
            elif e.response.status_code == 429:
                raise Exception("AI service is temporarily overloaded. Please wait a moment and try again.")
            else:
                raise Exception(f"AI service error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Q&A API Error: {str(e)}")
            # Don't use fallback - show the real error
            raise Exception(f"AI Q&A failed: {str(e)}")
    
    def _get_fallback_qa_response(self, question: str, content: str, analysis_summary: ContractSummary) -> dict:
        """Generate intelligent fallback response when AI fails"""
        question_lower = question.lower()
        content_lower = content.lower()
        
        # Simple keyword-based responses
        if 'payment' in question_lower or 'salary' in question_lower:
            # Look for payment terms in content
            payment_info = self._extract_payment_info(content_lower)
            return {
                "answer": payment_info,
                "relevant_sections": ["Payment Terms", "Compensation"],
                "page_references": []
            }
        
        elif 'termination' in question_lower or 'end' in question_lower:
            termination_info = self._extract_termination_info(content_lower)
            return {
                "answer": termination_info,
                "relevant_sections": ["Termination Clause"],
                "page_references": []
            }
        
        elif 'type' in question_lower or 'kind' in question_lower:
            contract_type = self._identify_contract_type(content_lower)
            return {
                "answer": contract_type,
                "relevant_sections": ["Contract Type"],
                "page_references": []
            }
        
        elif 'summarize' in question_lower or 'summary' in question_lower:
            summary = self._create_simple_summary(content, analysis_summary)
            return {
                "answer": summary,
                "relevant_sections": ["Contract Overview"],
                "page_references": []
            }
        
        else:
            # Generic response
            return {
                "answer": "I'm unable to process your question at the moment. Please try asking a specific question about payment terms, termination, or contract type.",
                "relevant_sections": [],
                "page_references": []
            }
    
    def _extract_payment_info(self, content: str) -> str:
        """Extract payment information from contract content"""
        if 'salary' in content:
            salary_match = re.search(r'\$[\d,]+', content)
            if salary_match:
                return f"Salary: {salary_match.group()}"
        
        if 'payment' in content:
            payment_match = re.search(r'payment.*?(\d+)\s*(?:days?|weeks?|months?)', content, re.IGNORECASE)
            if payment_match:
                return f"Payment terms: {payment_match.group()}"
        
        return "Payment terms not specified in the contract."
    
    def _extract_termination_info(self, content: str) -> str:
        """Extract termination information from contract content"""
        if 'termination' in content:
            termination_match = re.search(r'termination.*?(\d+)\s*(?:days?|weeks?|months?)', content, re.IGNORECASE)
            if termination_match:
                return f"Termination notice: {termination_match.group()}"
        
        return "Termination terms not specified in the contract."
    
    def _identify_contract_type(self, content: str) -> str:
        """Identify contract type from content"""
        if 'employment' in content:
            return "This is an Employment Agreement."
        elif 'service' in content:
            return "This is a Service Agreement."
        elif 'nda' in content or 'confidentiality' in content:
            return "This is a Non-Disclosure Agreement."
        else:
            return "Contract type not clearly specified."
    
    def _create_simple_summary(self, content: str, analysis_summary: ContractSummary) -> str:
        """Create a simple contract summary"""
        key_points = analysis_summary.key_points[:2] if analysis_summary.key_points else []
        return f"Contract summary: {'. '.join(key_points) if key_points else 'Standard contract terms apply.'}"
    
    def _create_qa_prompt(self, question: str, content: str, analysis_summary: ContractSummary) -> str:
        """Create intelligent Q&A prompt for professional, well-formatted responses"""
        
        # Analyze question type for better response formatting
        question_lower = question.lower()
        is_summary = any(word in question_lower for word in ['summarize', 'summary', 'overview', 'brief'])
        is_specific = any(word in question_lower for word in ['what is', 'when', 'where', 'how much', 'payment', 'salary', 'termination', 'confidentiality'])
        is_type = 'type' in question_lower or 'kind' in question_lower
        is_risk = any(word in question_lower for word in ['risk', 'assessment', 'danger', 'concern'])
        
        # Create context-aware instructions with formatting
        if is_summary:
            instruction = "Provide a professional 2-3 sentence summary with **bold** key terms and bullet points for main clauses."
        elif is_specific:
            instruction = "Give a direct, specific answer with **bold** important details and *italics* for emphasis where appropriate."
        elif is_type:
            instruction = "Identify the contract type in 1-2 sentences with **bold** contract type and *italics* for key characteristics."
        elif is_risk:
            instruction = "Provide risk assessment with **bold** risk levels and bullet points for specific concerns."
        else:
            instruction = "Provide a clear, focused answer with **bold** key terms and proper formatting for readability."
        
        return f"""
You are a professional contract analysis AI. Answer this question about the contract with proper formatting:

QUESTION: {question}

CONTRACT CONTENT:
{content[:6000]}  # Increased content limit for better analysis

INSTRUCTIONS:
{instruction}

FORMATTING REQUIREMENTS:
- Use **bold** for important terms, dates, amounts, and key clauses
- Use *italics* for emphasis and secondary details
- Use bullet points (•) for lists and multiple items - each point on a new line
- Use hyphens (-) for sub-points and clarifications
- Use proper paragraph breaks for readability
- Align information in a professional, structured manner

RESPONSE GUIDELINES:
- Be CONCISE and DIRECT
- If the question asks for specific details, provide them exactly
- If information is not in the contract, say "Not specified in the contract"
- For simple questions, give simple answers
- For complex questions, provide structured but brief responses
- DO NOT repeat generic phrases like "Based on the contract analysis"
- DO NOT include irrelevant information
- Use professional language and proper formatting
- Be CONSISTENT with dates and information across responses
- SEARCH THOROUGHLY through the entire contract content
- Look for related terms and synonyms (e.g., "payment" might be called "compensation", "salary", "remuneration")
- Check for dates, amounts, names, and specific clauses

RESPONSE FORMAT:
Provide your answer in plain text with proper formatting. Do NOT use JSON format.

IMPORTANT: 
- Keep answers short, relevant, and professionally formatted
- Use proper formatting for better readability
- Be consistent with contract details across all responses
- SEARCH CAREFULLY - don't give up easily, look for related terms
- For summaries, provide at least 5-7 key points with bullet points
- Use **bold** for key terms and amounts
- Use *italics* for emphasis
- Use bullet points (•) for lists
"""
    
    def _extract_key_terms(self, content: str) -> dict:
        """Extract key terms from contract content"""
        terms = {
            "payment_terms": [],
            "termination_clauses": [],
            "governing_law": [],
            "dispute_resolution": [],
            "intellectual_property": [],
            "currency": [],
            "payment_method": []
        }
        
        # Extract payment terms
        payment_patterns = [
            r'payment.*?(\d+)\s*(?:days?|weeks?|months?)',
            r'(\d+)\s*(?:days?|weeks?|months?).*?payment',
            r'payment.*?due.*?(\d+)\s*(?:days?|weeks?|months?)'
        ]
        for pattern in payment_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            terms["payment_terms"].extend(matches)
        
        # Extract termination clauses
        termination_patterns = [
            r'terminat.*?(\d+)\s*(?:days?|weeks?|months?)',
            r'(\d+)\s*(?:days?|weeks?|months?).*?terminat',
            r'expir.*?(\d+)\s*(?:days?|weeks?|months?)'
        ]
        for pattern in termination_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            terms["termination_clauses"].extend(matches)
        
        # Extract governing law
        law_matches = re.findall(r'govern.*?law.*?([A-Za-z\s]+)', content, re.IGNORECASE)
        terms["governing_law"] = law_matches
        
        # Extract dispute resolution
        dispute_matches = re.findall(r'dispute.*?resolut.*?([A-Za-z\s]+)', content, re.IGNORECASE)
        terms["dispute_resolution"] = dispute_matches
        
        # Extract IP terms
        ip_matches = re.findall(r'intellectual.*?property.*?([A-Za-z\s]+)', content, re.IGNORECASE)
        terms["intellectual_property"] = ip_matches
        
        # Extract currency
        currency_matches = re.findall(r'(\$|€|£|USD|EUR|GBP)', content, re.IGNORECASE)
        terms["currency"] = currency_matches
        
        # Extract payment method
        payment_method_matches = re.findall(r'(bank.*?transfer|check|cash|credit.*?card)', content, re.IGNORECASE)
        terms["payment_method"] = payment_method_matches
        
        return terms
    
    def _parse_qa_response(self, response_text: str, question: str) -> dict:
        """Parse Q&A response with intelligent cleaning - no JSON parsing"""
        try:
            # Clean the response text thoroughly
            cleaned_text = response_text.strip()
            
            # Remove any JSON artifacts completely
            cleaned_text = re.sub(r'^json\s*', '', cleaned_text, flags=re.IGNORECASE)
            cleaned_text = re.sub(r'^```json\s*', '', cleaned_text, flags=re.IGNORECASE)
            cleaned_text = re.sub(r'^```\s*', '', cleaned_text)
            cleaned_text = re.sub(r'```\s*$', '', cleaned_text)
            
            # Remove JSON structure artifacts
            cleaned_text = re.sub(r'^\{.*?"answer":\s*"([^"]*)".*?\}$', r'\1', cleaned_text, flags=re.DOTALL)
            cleaned_text = re.sub(r'^\{.*?"answer":\s*"([^"]*)".*$', r'\1', cleaned_text, flags=re.DOTALL)
            cleaned_text = re.sub(r'^.*?"answer":\s*"([^"]*)".*?\}$', r'\1', cleaned_text, flags=re.DOTALL)
            
            # Remove any remaining JSON brackets and braces
            cleaned_text = re.sub(r'^\{.*?\}$', '', cleaned_text, flags=re.DOTALL)
            cleaned_text = re.sub(r'^\[.*?\]$', '', cleaned_text, flags=re.DOTALL)
            cleaned_text = re.sub(r'\{[^{}]*\}', '', cleaned_text)
            cleaned_text = re.sub(r'\[[^\[\]]*\]', '', cleaned_text)
            
            # Remove quotes around the entire response
            cleaned_text = re.sub(r'^"(.*)"$', r'\1', cleaned_text, flags=re.DOTALL)
            cleaned_text = re.sub(r'^\'(.*)\'$', r'\1', cleaned_text, flags=re.DOTALL)
            
            # Remove common JSON field names if they appear
            cleaned_text = re.sub(r'"answer":\s*', '', cleaned_text)
            cleaned_text = re.sub(r'"source_locations":\s*', '', cleaned_text)
            cleaned_text = re.sub(r'"relevant_sections":\s*', '', cleaned_text)
            cleaned_text = re.sub(r'"page_references":\s*', '', cleaned_text)
            
            # Clean and format the answer
            cleaned_answer = self._clean_qa_answer(cleaned_text, question)
            
            # Generate some basic source information based on content
            relevant_sections = self._extract_relevant_sections(cleaned_answer)
            
            return {
                "answer": cleaned_answer,
                "relevant_sections": relevant_sections,
                "page_references": []
            }
                
        except Exception as e:
            logger.error(f"Q&A parsing error: {e}")
            return {
                "answer": self._emergency_clean_response(response_text),
                "relevant_sections": [],
                "page_references": []
            }
    
    def _clean_qa_answer(self, answer: str, question: str) -> str:
        """Clean and format Q&A answer intelligently"""
        if not answer:
            return "No answer available."
        
        # Remove any remaining JSON artifacts
        answer = re.sub(r'\{[^{}]*\}', '', answer)
        answer = re.sub(r'\[[^\[\]]*\]', '', answer)
        answer = re.sub(r'"[^"]*":\s*', '', answer)
        
        # Remove common AI artifacts
        answer = re.sub(r'Based on the contract analysis,?\s*', '', answer, flags=re.IGNORECASE)
        answer = re.sub(r'here\'s what I found:?\s*', '', answer, flags=re.IGNORECASE)
        answer = re.sub(r'According to the contract,?\s*', '', answer, flags=re.IGNORECASE)
        answer = re.sub(r'The contract states,?\s*', '', answer, flags=re.IGNORECASE)
        
        # Remove excessive whitespace but preserve structure
        answer = re.sub(r'[ \t]+', ' ', answer)
        answer = re.sub(r'\n\s*\n\s*\n+', '\n\n', answer)
        answer = answer.strip()
        
        # For summary questions, ensure we have enough content
        question_lower = question.lower()
        if any(word in question_lower for word in ['summary', 'summarize', 'key points', 'overview']):
            # Don't truncate summaries, they should be comprehensive
            pass
        elif len(answer) > 800:
            # For other questions, truncate if too long
            sentences = answer.split('.')
            if len(sentences) > 3:
                answer = '. '.join(sentences[:3]) + '.'
        
        return answer
    
    def _extract_relevant_sections(self, answer: str) -> list:
        """Extract relevant sections from the answer content"""
        sections = []
        
        # Look for mentions of specific contract sections
        section_patterns = [
            r'payment.*?terms?',
            r'termination.*?clause',
            r'confidentiality.*?agreement',
            r'intellectual.*?property',
            r'ownership.*?materials?',
            r'consulting.*?agreement',
            r'schedule.*?[A-Z]',
            r'fees.*?outlined',
            r'contract.*?duration'
        ]
        
        for pattern in section_patterns:
            matches = re.findall(pattern, answer, re.IGNORECASE)
            for match in matches:
                if match.strip():
                    sections.append(match.strip().title())
        
        # If no specific sections found, provide generic ones based on content
        if not sections:
            if 'payment' in answer.lower():
                sections.append('Payment Terms')
            if 'termination' in answer.lower() or 'end' in answer.lower():
                sections.append('Termination Clause')
            if 'ownership' in answer.lower() or 'materials' in answer.lower():
                sections.append('Ownership of Materials')
            if 'consulting' in answer.lower() or 'services' in answer.lower():
                sections.append('Service Agreement')
        
        return sections[:3]  # Limit to 3 sections
                
    def _deep_clean_response(self, text: str) -> str:
        """Aggressively clean response text"""
        if not text:
            return ""
            
        # Remove JSON/array artifacts but preserve content
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        
        # Remove escaped characters
        text = re.sub(r'\\n', '\n', text)
        text = re.sub(r'\\"', '"', text)
        text = re.sub(r'\\t', '\t', text)
        
        # Remove excessive whitespace but preserve structure
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        
        # Remove trailing artifacts
        text = re.sub(r'\s*\.\.\.\s*$', '', text)
        text = re.sub(r'\s*,\s*$', '', text)
        
        # Remove specific problematic patterns that don't contain actual content
        text = re.sub(r'\s*\[[^]]*paginated[^]]*\]', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\s*\[[^]]*not specified[^]]*\]', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\s*\[[^]]*content provided[^]]*\]', '', text, flags=re.IGNORECASE)
        
        # Only remove empty arrays/objects, not those with content
        text = re.sub(r'\s*\[\s*\]\s*', '', text)
        text = re.sub(r'\s*\{\s*\}\s*', '', text)
        
        return text.strip()
    
    def _extract_structured_data(self, text: str) -> dict:
        """Extract structured data from cleaned response"""
        try:
            # Try to extract JSON
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
        except:
            pass
        
        # Fallback: extract sections manually
        sections = []
        references = []
        
        # Look for section patterns
        section_matches = re.findall(r'relevant.*?section.*?[:=]\s*([^,\n]+)', text, re.IGNORECASE)
        sections.extend(section_matches)
        
        # Look for page reference patterns
        page_matches = re.findall(r'page.*?reference.*?[:=]\s*([^,\n]+)', text, re.IGNORECASE)
        references.extend(page_matches)
        
        return {
            "answer": text,
            "relevant_sections": sections,
            "page_references": references
        }
    
    def _clean_sections(self, sections: list) -> list:
        """Clean and validate relevant sections"""
        if not sections:
            return []
        
        cleaned = []
        for section in sections:
            if isinstance(section, str) and section.strip():
                # Clean the section text
                cleaned_section = section.strip()
                # Remove quotes and extra whitespace
                cleaned_section = re.sub(r'^["\']+|["\']+$', '', cleaned_section)
                cleaned_section = re.sub(r'\s+', ' ', cleaned_section)
                
                # Only add if it's meaningful and not just a copy of the answer
                if len(cleaned_section) > 10 and len(cleaned_section) < 200:
                    cleaned.append(cleaned_section)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_sections = []
        for section in cleaned:
            if section.lower() not in seen:
                seen.add(section.lower())
                unique_sections.append(section)
        
        return unique_sections[:3]  # Limit to 3 most relevant sections
    
    def _format_intelligent_answer(self, answer: str, question: str) -> str:
        """Format answer intelligently based on question type"""
        # Determine question category
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['summar', 'overview', 'key points', 'main points']):
            return self._format_as_structured_points(answer)
        elif any(word in question_lower for word in ['list', 'what are', 'enumerate']):
            return self._format_as_structured_points(answer)
        else:
            return self._clean_answer_formatting(answer)
    
    def _format_as_structured_points(self, text: str) -> str:
        """Format text as structured bullet points"""
        # Pre-clean existing bullet points
        text = re.sub(r'•\s*([^•]+)•\s*', r'• \1\n\n• ', text)
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Convert to bullet points
        bullet_points = []
        for sentence in sentences:
            if len(sentence) > 10:  # Only convert meaningful sentences
                bullet_points.append(f"• {sentence}")
        
        if len(bullet_points) > 1:
            return "\n".join(bullet_points)
        elif len(bullet_points) == 1:
            return bullet_points[0].replace("• ", "")
        else:
            return self._break_down_paragraph(text)
    
    def _break_down_paragraph(self, text: str) -> str:
        """Break down paragraph into structured format"""
        # Split by colons first
        if ':' in text:
            parts = text.split(':')
            if len(parts) > 1:
                formatted_parts = []
                for i, part in enumerate(parts):
                    if i == 0:
                        formatted_parts.append(part.strip())
                    else:
                        formatted_parts.append(f"• {part.strip()}")
                return "\n".join(formatted_parts)
        
        # Split long sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip() and len(s) > 20]
        
        if len(sentences) > 1:
            return "\n".join([f"• {s}" for s in sentences])
        else:
            return text
    
    def _clean_answer_formatting(self, text: str) -> str:
        """Clean and format answer text"""
        # Remove excessive line breaks
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
        
        # Ensure proper spacing
        text = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', text)
        
        # Clean up bullet points
        text = re.sub(r'^\s*[-•]\s*', '• ', text, flags=re.MULTILINE)
        
        return text.strip()
    
    def _clean_references(self, references: list) -> list:
        """Clean and validate page references"""
        if not references:
            return []
        
        cleaned = []
        for ref in references:
            if isinstance(ref, str) and ref.strip():
                cleaned_ref = self._deep_clean_response(ref)
                if cleaned_ref and len(cleaned_ref) > 3:
                    cleaned.append(cleaned_ref)
        
        return list(dict.fromkeys(cleaned))
    
    def _clean_source_locations(self, source_locations: list) -> list:
        """Clean and format source locations"""
        if not source_locations:
            return []
        
        cleaned = []
        for location in source_locations:
            if isinstance(location, dict):
                cleaned_location = {
                    "line_number": location.get("line_number", "N/A"),
                    "paragraph": location.get("paragraph", "N/A"),
                    "page": location.get("page", "N/A"),
                    "excerpt": location.get("excerpt", "")[:100]  # Limit excerpt length
                }
                cleaned.append(cleaned_location)
            elif isinstance(location, str):
                cleaned.append({
                    "line_number": "N/A",
                    "paragraph": "N/A", 
                    "page": "N/A",
                    "excerpt": location[:100]
                })
        
        return cleaned[:3]  # Limit to 3 source locations
    
    def _emergency_clean_response(self, text: str) -> str:
        """Emergency fallback cleaning for critical failures"""
        try:
            text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
            text = re.sub(r'\{[^}]*\}', '', text)
            text = re.sub(r'\[[^\]]*\]', '', text)
            text = re.sub(r'\\n', '\n', text)
            text = re.sub(r'\\"', '"', text)
            text = re.sub(r'\s+', ' ', text)
            
            if len(text) > 500:
                text = text[:500] + '...'
            
            return text.strip() or "I couldn't process that response properly. Please try asking your question again."
            
        except Exception:
            return "I couldn't process that response properly. Please try asking your question again."
    
    def _get_user_friendly_error(self, error: str) -> str:
        """Convert technical errors to user-friendly messages"""
        error_lower = error.lower()
        
        if "api key" in error_lower:
            return "AI service is not properly configured. Please contact support."
        elif "rate limit" in error_lower:
            return "AI service is currently busy. Please try again in a moment."
        elif "timeout" in error_lower:
            return "The request took too long. Please try again."
        elif "network" in error_lower:
            return "Network connection issue. Please check your internet connection."
        else:
            return "An error occurred while processing your request. Please try again."
    
    # ==================== FUTURE LANGCHAIN INTEGRATION ====================
    
    async def get_contract_embeddings(self, content: str) -> List[float]:
        """Get embeddings for contract content (for future LangChain integration)"""
        logger.info("Embeddings method called (not yet implemented)")
        pass
    
    async def semantic_search(self, query: str, contract_chunks: List[str]) -> List[str]:
        """Semantic search in contract chunks (for future LangChain integration)"""
        logger.info("Semantic search method called (not yet implemented)")
        pass

# Global AI service instance
ai_service = AIService() 