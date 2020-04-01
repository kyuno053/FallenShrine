# Command List

## Operators
   - settings : %
   - debug : #
   - user commands : !
## Settings commands
   - ##### setChannel
        **Set the listening channel for a feature.**
        
        **Parameter:** the feature to listen in the channel
        
        **Example:** 
        ``` 
        %settings setChannel gs
        ```
        *set the channel for the Siege feature* 
        
        
   - ##### setAdminRole
        **Set role considered as Admin by the bot.**
                
        **Parameter:** the role name
                
        **Example:**
        ``` 
        %settings setAdminRole my_admin_role
        ```
        *register the my_admin_role as Admin role* 
   
   - ##### setUsersRole
        **Set role considered as User by the bot.**
                
        **Parameter:** the role name
                
        **Example:**
        ``` 
        %settings setUsersRole my_user_role
        ```
        *register the my_user_role as User role* 
          
   - ##### generateSiegeFile

        **Generate the data file for the Siege feature.**
                
        **Example:**
        ``` 
        %settings generateSiegeFile
        ```
    
## Debug commands

   - ##### ping
        **If the bot works , return pong**
        
        **Example:** 
        ``` 
        #ping
        ```
   - ##### siegeFile
        **check if the Siege data file exist**
         
        **Example:** 
        ``` 
         #siegeFile
        ```    
   - ##### userCount
        **returns the total number of users included in the registered roles**          
        **Example:** 
        ``` 
         #userCount
        ```    

## User commands

- #### Siege
    - ##### help
         **Display all the commands for this feature**
                 
         **Optional parameter:** Command name
                 
         **Example:**
         ``` 
         !gs help
         !gs help showMyTeams
         ```
         *Display general help* 
         
         *Display the help for showMyTeams command*

    - ##### addNat5Def
         **Add siege defence for regular towers**
                 
         **Parameter:** the 3 monsters to add
                 
         **Example:**
         ``` 
         !gs addNat5Def a/b/c
         ```
         *Add defence team with a, b and c as monsters*        
         
    - ##### addNat4Def
         **Add siege defence for 4 star towers**
                 
         **Parameter:** the 3 monsters to add
                 
         **Example:**
         ``` 
         !gs addNat4Def a/b/c
         ```
         *Add defence team with a, b and c as monsters*        
         
    - ##### modify
         **Modify defence team**
                 
         **Parameter:** the old and new team
                 
         **Example:**
         ``` 
         !gs modify old_a/old_b/old_c->new_a/new_b/new_c
         ```
         *Modify defence team with old_team->new_team* 
    - ##### delete
         **Delete siege defence**
                 
         **Parameter:** the team to delete
                 
         **Example:**
         ``` 
         !gs delete a/b/c
         ```
         *Delete defence team with a, b and c as monsters*    
         
    - ##### showMyTeams
         **Display user siege defence**
                 
         **Example:**
         ``` 
         !gs showMyTeams
         ```
         *Display teams*             

    - ##### showAllTeams
         **Display all user siege defence**
                 
         **Example:**
         ``` 
         !gs showAllTeams
         ```
         *Display all teams* 
         
    - ##### reset
         **Reset user teams**
                 
         **Example:**
         ``` 
         !gs reset
         ```
         *Reset teams*                      
