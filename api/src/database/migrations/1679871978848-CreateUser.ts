import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1679871978848 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        surname varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        hash_password varchar(255) NOT NULL,
        data_criacao datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_update datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ativo BOOLEAN NOT NULL DEFAULT true,
        perfil text NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY email (email)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users;`);
  }
}
