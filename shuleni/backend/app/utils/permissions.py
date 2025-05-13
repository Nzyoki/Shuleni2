from ..models import User

def check_permission(user: User, permission: str) -> bool:
    """
    Check if a user has a specific permission based on their role.
    
    Args:
        user (User): The user to check permissions for
        permission (str): The permission to check
        
    Returns:
        bool: True if the user has the permission, False otherwise
    """
    if not user or not user.role:
        return False

    # Define role-based permissions
    role_permissions = {
        'super_admin': [
            # Platform Management
            'manage_platform',
            'manage_schools',
            'manage_all_users',
            'view_analytics',
            'manage_settings',
            
            # School Management
            'manage_school',
            'manage_teachers',
            'manage_students',
            'manage_classes',
            'manage_resources',
            'manage_assessments',
            'view_attendance',
            'monitor_chat',
            'view_school_reports',
            
            # Class Management
            'manage_class',
            'take_attendance',
            'create_assessments',
            'grade_assessments',
            'send_notifications',
            'view_class_reports',
            
            # Resource Management
            'manage_resources',
            'view_resources',
            
            # Assessment Management
            'manage_assessments',
            'take_assessments',
            
            # User Management
            'manage_users',
            'manage_all_users',
            'create_users',
            'edit_users',
            'delete_users',
            'view_users',
            'update_profile',
            
            # Communication
            'participate_chat',
            
            # Reports and Analytics
            'view_reports',
            'view_analytics',
            'view_attendance',
            'view_school_reports',
            'view_class_reports'
        ],
        'school_admin': [
            # School Management
            'manage_school',
            'manage_teachers',
            'manage_students',
            'manage_school_students',
            'manage_classes',
            'manage_school_classes',
            'manage_resources',
            'manage_assessments',
            'view_attendance',
            'manage_attendance',
            'take_attendance',
            'monitor_chat',
            'view_school_reports',
            
            # User Management for their school
            'view_users',
            'manage_users',
            'create_users',
            'edit_users',
            'delete_users',
            
            # Analytics specifically for their school
            'view_analytics',
            'view_school_analytics',
            'view_reports',
            'view_school_reports',
            
            # Resource Management
            'manage_resources',
            'view_resources',
            'create_resources',
            'edit_resources',
            'delete_resources',
            
            # Assessment Management
            'manage_assessments',
            'view_assessments',
            'create_assessments',
            'edit_assessments',
            'grade_assessments',
            
            # Class Management
            'view_class_students',
            'manage_class_students',
            'view_class_reports',
            'manage_class_assessments',
            
            # Communication within school
            'participate_chat',
            'send_notifications'
        ],
        'teacher': [
            'manage_class',
            'take_attendance',
            'manage_resources',
            'create_assessments',
            'grade_assessments',
            'participate_chat',
            'send_notifications',
            'view_class_reports'
        ],
        'student': [
            'view_resources',
            'take_assessments',
            'view_attendance',
            'participate_chat',
            'update_profile'
        ]
    }

    # If permission is an array, check if user has any of them
    if isinstance(permission, list):
        return any(perm in role_permissions.get(user.role, []) for perm in permission)
    
    return permission in role_permissions.get(user.role, []) 