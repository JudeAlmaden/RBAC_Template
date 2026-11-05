<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\CourseEnrollment;
use App\Models\Module;
use App\Models\SectionPage;
use App\Models\Topic;
use App\Models\TopicSection;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CourseCurriculumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first()
            ?? User::where('email', 'superadmin@example.com')->first();
        $learner = User::where('email', 'learner@example.com')->first();

        $coursesData = [
            [
                'title' => 'CYB-100',
                'slug' => 'cyb-100',
                'description' => 'Comprehensive introduction to cybersecurity fundamentals, defense-in-depth principles, network architecture, and security hygiene.',
                'status' => 'published',
                'modules' => [
                    [
                        'title' => '101 - Foundations of Cyber Defense',
                        'description' => 'Core security concepts, the CIA Triad, threat actor taxonomy, and fundamental defense architecture.',
                        'topics' => [
                            [
                                'title' => 'T01 - Core Principles: CIA Triad & Defense-in-Depth',
                                'minutes' => 45,
                                'stages' => $this->getStandardStages(),
                            ],
                            [
                                'title' => 'T02 - Threat Actors, Vectors & Attack Surface',
                                'minutes' => 40,
                                'stages' => $this->getHandsOnLabStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '102 - Network Security Architecture',
                        'description' => 'Packet inspection, subnet segmentation, firewalls, and secure perimeter topologies.',
                        'topics' => [
                            [
                                'title' => 'T01 - OSI Model & Network Protocols Security',
                                'minutes' => 50,
                                'stages' => $this->getStandardStages(),
                            ],
                            [
                                'title' => 'T02 - Firewall Topologies & Packet Filtering',
                                'minutes' => 60,
                                'stages' => $this->getHandsOnLabStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '103 - Operating System Hardening',
                        'description' => 'Host-level defense, permissions lockdown, service auditing, and baseline security configurations.',
                        'topics' => [
                            [
                                'title' => 'T01 - Linux Kernel & Access Control Hardening',
                                'minutes' => 45,
                                'stages' => $this->getStandardStages(),
                            ],
                            [
                                'title' => 'T02 - Windows Group Policy & Defender Policies',
                                'minutes' => 55,
                                'stages' => $this->getHandsOnLabStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '104 - Identity & Access Management (IAM)',
                        'description' => 'Authentication models, multi-factor authorization, role-based access, and privilege escalation prevention.',
                        'topics' => [
                            [
                                'title' => 'T01 - Zero Trust Identity Architecture & MFA',
                                'minutes' => 40,
                                'stages' => $this->getStandardStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '105 - Incident Response & Security Operations',
                        'description' => 'First responder workflow, triage logging, containment procedures, and chain of custody.',
                        'topics' => [
                            [
                                'title' => 'T01 - Triage Lifecycle & Incident Classification',
                                'minutes' => 50,
                                'stages' => $this->getStandardStages(),
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'CSS-200',
                'slug' => 'css-200',
                'description' => 'Intermediate cyber security systems engineering, cryptography pipelines, secure SDLC, and protocol implementation.',
                'status' => 'published',
                'modules' => [
                    [
                        'title' => '201 - Cryptographic Primitives & Key Management',
                        'description' => 'Symmetric vs asymmetric ciphers, hashing standards, PKI hierarchy, and key lifecycle management.',
                        'topics' => [
                            [
                                'title' => 'T01 - Modern Symmetric & Asymmetric Encryption',
                                'minutes' => 60,
                                'stages' => $this->getStandardStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '202 - Secure Network Protocols & Transport Security',
                        'description' => 'TLS 1.3 handshake mechanics, mutual authentication (mTLS), and cryptographic tunnel hardening.',
                        'topics' => [
                            [
                                'title' => 'T01 - TLS 1.3 Architecture & Handshake Analysis',
                                'minutes' => 55,
                                'stages' => $this->getHandsOnLabStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '203 - Endpoint Protection & Detection Engineering',
                        'description' => 'Endpoint detection and response (EDR), behavior heuristic baselines, and detection telemetry.',
                        'topics' => [
                            [
                                'title' => 'T01 - Behavioral Heuristics & Sensor Telemetry',
                                'minutes' => 50,
                                'stages' => $this->getStandardStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '204 - Cloud Infrastructure & Container Security',
                        'description' => 'Immutable workloads, Docker container isolation, Kubernetes RBAC, and cloud posture management.',
                        'topics' => [
                            [
                                'title' => 'T01 - Container Isolation & Kernel Namespaces',
                                'minutes' => 60,
                                'stages' => $this->getHandsOnLabStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '205 - Security Operations & SIEM Pipeline Design',
                        'description' => 'Log ingestion normalization, alert correlation, detection rule authoring, and SOAR automation.',
                        'topics' => [
                            [
                                'title' => 'T01 - SIEM Ingestion & Sigma Rule Authoring',
                                'minutes' => 65,
                                'stages' => $this->getStandardStages(),
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'THR-300',
                'slug' => 'thr-300',
                'description' => 'Advanced threat hunting methodologies, memory forensics, reverse engineering, and APT campaign tracking.',
                'status' => 'published',
                'modules' => [
                    [
                        'title' => '301 - Advanced Memory Forensics & Process Injection',
                        'description' => 'RAM dump acquisition, Volatility 3 analysis, DLL hollowing detection, and hidden process triage.',
                        'topics' => [
                            [
                                'title' => 'T01 - Volatility 3 Memory Acquisition & Triage',
                                'minutes' => 75,
                                'stages' => $this->getHandsOnLabStages(),
                            ],
                            [
                                'title' => 'T02 - Process Hollowing & Hooking Detection',
                                'minutes' => 70,
                                'stages' => $this->getStandardStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '302 - Host-based Indicator of Compromise (IoC) Extraction',
                        'description' => 'YARA rule development, filesystem timeline reconstruction, and persistence mechanism analysis.',
                        'topics' => [
                            [
                                'title' => 'T01 - Advanced YARA Rule Authoring & Memory Scanning',
                                'minutes' => 60,
                                'stages' => $this->getHandsOnLabStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '303 - Network Traffic Analysis & C2 Beaconing',
                        'description' => 'Extracting covert channels, beaconing jitter analysis, protocol tunneling, and JA3 fingerprinting.',
                        'topics' => [
                            [
                                'title' => 'T01 - C2 Beacon Detection & TLS Fingerprinting',
                                'minutes' => 65,
                                'stages' => $this->getHandsOnLabStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '304 - Malware Sandbox Execution & Dynamic Triage',
                        'description' => 'Automated sandbox execution, API call hooking, network egress interception, and behavioral profiling.',
                        'topics' => [
                            [
                                'title' => 'T01 - Dynamic Behavioral Profiling & API Telemetry',
                                'minutes' => 80,
                                'stages' => $this->getStandardStages(),
                            ],
                        ],
                    ],
                    [
                        'title' => '305 - Threat Intelligence Correlation & MITRE ATT&CK',
                        'description' => 'Mapping adversarial techniques to MITRE ATT&CK, adversary emulation, and threat actor profiling.',
                        'topics' => [
                            [
                                'title' => 'T01 - ATT&CK Technique Mapping & Emulation Planning',
                                'minutes' => 70,
                                'stages' => $this->getStandardStages(),
                            ],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($coursesData as $cIdx => $cData) {
            $course = Course::updateOrCreate(
                ['slug' => $cData['slug']],
                [
                    'title' => $cData['title'],
                    'description' => $cData['description'],
                    'status' => $cData['status'],
                    'created_by' => $admin?->id,
                    'published_at' => now(),
                ]
            );

            // Seed Modules (101-105, 201-205, 301-305)
            foreach ($cData['modules'] as $mIdx => $mData) {
                $module = Module::updateOrCreate(
                    [
                        'course_id' => $course->id,
                        'position' => $mIdx + 1,
                    ],
                    [
                        'title' => $mData['title'],
                        'description' => $mData['description'],
                        'is_published' => true,
                    ]
                );

                // Seed Topics inside Module (T01, T02...)
                foreach ($mData['topics'] as $tIdx => $tData) {
                    $topicSlug = Str::slug($tData['title']);
                    $topic = Topic::updateOrCreate(
                        [
                            'module_id' => $module->id,
                            'position' => $tIdx + 1,
                        ],
                        [
                            'title' => $tData['title'],
                            'slug' => $topicSlug,
                            'description' => "In-depth instructional unit covering {$tData['title']}.",
                            'estimated_minutes' => $tData['minutes'],
                            'is_published' => true,
                        ]
                    );

                    // Seed Pedagogical Stages inside Topic (No numbers in stage title)
                    foreach ($tData['stages'] as $sIdx => $sData) {
                        $stage = TopicSection::updateOrCreate(
                            [
                                'topic_id' => $topic->id,
                                'position' => $sIdx + 1,
                            ],
                            [
                                'section_type' => $sData['section_type'],
                                'title' => $sData['title'],
                                'instructions' => $sData['instructions'],
                                'is_required' => $sData['is_required'] ?? true,
                                'is_published' => true,
                            ]
                        );

                        // Seed Container Pages inside Stage
                        foreach ($sData['pages'] as $pIdx => $pData) {
                            SectionPage::updateOrCreate(
                                [
                                    'topic_section_id' => $stage->id,
                                    'position' => $pIdx + 1,
                                ],
                                [
                                    'title' => $pData['title'],
                                    'layout_type' => $pData['layout_type'],
                                    'is_visible' => true,
                                ]
                            );
                        }
                    }
                }
            }

            // Assign CYB-100 to the test learner user if available
            if ($learner && $cData['slug'] === 'cyb-100') {
                $assignment = CourseAssignment::firstOrCreate(
                    [
                        'course_id' => $course->id,
                        'target_type' => 'user',
                        'target_id' => $learner->id,
                    ],
                    [
                        'assigned_by' => $admin?->id,
                        'due_at' => now()->addDays(30),
                        'required' => true,
                    ]
                );

                CourseEnrollment::firstOrCreate(
                    [
                        'course_id' => $course->id,
                        'user_id' => $learner->id,
                    ],
                    [
                        'course_assignment_id' => $assignment->id,
                        'status' => 'in_progress',
                        'enrolled_at' => now(),
                        'started_at' => now(),
                        'progress_percent' => 20.0,
                    ]
                );
            }
        }
    }

    /**
     * Standard pedagogical flow with container pages — NO numbers in stage titles.
     */
    private function getStandardStages(): array
    {
        return [
            [
                'section_type' => 'activate',
                'title' => 'Activate: Warm-up & Context',
                'instructions' => 'Prime prior knowledge with an interactive diagnostic review before proceeding.',
                'pages' => [
                    [
                        'title' => 'Page 1: Context & Core Objectives',
                        'layout_type' => 'single_column',
                    ],
                ],
            ],
            [
                'section_type' => 'encode',
                'title' => 'Encode: Concept Walkthrough',
                'instructions' => 'Analyze core architecture principles, data flow diagrams, and expert video breakdowns.',
                'pages' => [
                    [
                        'title' => 'Page 1: Architecture Diagrams & Theory',
                        'layout_type' => 'split_two_column',
                    ],
                    [
                        'title' => 'Page 2: Guided Interactive Walkthrough',
                        'layout_type' => 'cinema_focus',
                    ],
                ],
            ],
            [
                'section_type' => 'retrieve',
                'title' => 'Retrieve: Active Recall Check',
                'instructions' => 'Test your immediate retention and recall with short scenario prompts.',
                'pages' => [
                    [
                        'title' => 'Page 1: Knowledge Checkpoint',
                        'layout_type' => 'single_column',
                    ],
                ],
            ],
            [
                'section_type' => 'anchor',
                'title' => 'Anchor: Real-World Scenario',
                'instructions' => 'Review a post-incident forensic case study to evaluate real-world trade-offs.',
                'pages' => [
                    [
                        'title' => 'Page 1: Industry Incident Breakdown',
                        'layout_type' => 'split_two_column',
                    ],
                ],
            ],
            [
                'section_type' => 'deepen',
                'title' => 'Deepen: Advanced Challenges & Synthesis',
                'instructions' => 'Explore adversarial evasion techniques, counter-measures, and resilient design choices.',
                'pages' => [
                    [
                        'title' => 'Page 1: Advanced Tradeoffs & Edge Cases',
                        'layout_type' => 'single_column',
                    ],
                ],
            ],
            [
                'section_type' => 'assessment',
                'title' => 'Assessment: Mastery Checkpoint',
                'instructions' => 'Verify mastery through graded comprehension questions before advancing.',
                'pages' => [
                    [
                        'title' => 'Page 1: Graded Evaluation Form',
                        'layout_type' => 'single_column',
                    ],
                ],
            ],
        ];
    }

    /**
     * Hands-on lab focused stage flow — NO numbers in stage titles.
     */
    private function getHandsOnLabStages(): array
    {
        return [
            [
                'section_type' => 'activate',
                'title' => 'Activate: Lab Objectives & Setup',
                'instructions' => 'Review the lab environment topology, credentials, and defense requirements.',
                'pages' => [
                    [
                        'title' => 'Page 1: Environment Provisioning & Rules',
                        'layout_type' => 'single_column',
                    ],
                ],
            ],
            [
                'section_type' => 'encode',
                'title' => 'Encode: Guided Walkthrough',
                'instructions' => 'Understand the command structure, tools, and execution methodology.',
                'pages' => [
                    [
                        'title' => 'Page 1: Step-by-Step Command Guide',
                        'layout_type' => 'split_two_column',
                    ],
                ],
            ],
            [
                'section_type' => 'lab',
                'title' => 'Lab: Hands-on Execution',
                'instructions' => 'Execute forensic commands and verify artifacts in the live sandbox environment.',
                'pages' => [
                    [
                        'title' => 'Page 1: Live Terminal / Sandbox Workspace',
                        'layout_type' => 'cinema_focus',
                    ],
                    [
                        'title' => 'Page 2: Artifact Validation & Evidence Notes',
                        'layout_type' => 'split_two_column',
                    ],
                ],
            ],
            [
                'section_type' => 'deepen',
                'title' => 'Deepen: Challenge & Reflection',
                'instructions' => 'Formulate remediation policies and patch recommendations based on lab findings.',
                'pages' => [
                    [
                        'title' => 'Page 1: Defense Recommendations & Hardening Script',
                        'layout_type' => 'single_column',
                    ],
                ],
            ],
            [
                'section_type' => 'assessment',
                'title' => 'Assessment: Practical Checkpoint',
                'instructions' => 'Submit lab flag verifications and technical synthesis.',
                'pages' => [
                    [
                        'title' => 'Page 1: Evidence Submission & Grading',
                        'layout_type' => 'single_column',
                    ],
                ],
            ],
        ];
    }
}
